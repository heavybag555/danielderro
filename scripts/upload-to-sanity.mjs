import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const API_VERSION = process.env.SANITY_API_VERSION || "2026-03-01";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const API = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff"]);

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function sanityFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN}`, ...opts.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sanity API ${res.status}: ${body}`);
  }
  return res.json();
}

async function uploadAsset(filePath, filename) {
  const buffer = await readFile(filePath);
  const ext = extname(filename).toLowerCase();
  const res = await fetch(`${API}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": MIME[ext] || "application/octet-stream",
    },
    body: buffer,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.document;
}

async function createDocuments(mutations) {
  return sanityFetch(`/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
}

async function getImageFiles(dirPath) {
  const entries = await readdir(dirPath);
  return entries
    .filter((f) => SUPPORTED.has(extname(f).toLowerCase()) && !f.startsWith("."))
    .sort();
}

async function processFolder(folderName, folderPath) {
  console.log(`\n📁 ${folderName}`);

  const imageFiles = await getImageFiles(folderPath);
  if (imageFiles.length === 0) {
    console.log(`   ⚠ No images, skipping.`);
    return;
  }
  console.log(`   ${imageFiles.length} images`);

  const photoMutations = [];
  let coverAssetId = null;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const filePath = join(folderPath, file);
    const tag = `[${i + 1}/${imageFiles.length}]`;

    try {
      process.stdout.write(`   ${tag} ${file}...`);
      const asset = await uploadAsset(filePath, file);
      process.stdout.write(` ✓ ${asset._id}\n`);

      if (i === 0) coverAssetId = asset._id;

      const titleBase = file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
      const photoId = `photo-${slugify(folderName)}-${i}`;

      photoMutations.push({
        create: {
          _id: photoId,
          _type: "photo",
          title: titleBase,
          image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
          clientName: folderName,
          tags: [folderName],
        },
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  if (photoMutations.length === 0) return;

  console.log(`   Creating ${photoMutations.length} photo docs + 1 project doc...`);

  const slug = slugify(folderName);
  const projectId = `project-${slug}`;

  const projectMutation = {
    create: {
      _id: projectId,
      _type: "project",
      name: folderName,
      slug: { _type: "slug", current: slug },
      clientName: folderName,
      coverImage: coverAssetId
        ? { _type: "image", asset: { _type: "reference", _ref: coverAssetId } }
        : undefined,
      photos: photoMutations.map((m, i) => ({
        _type: "reference",
        _ref: m.create._id,
        _key: `ref-${i}`,
      })),
    },
  };

  const allMutations = [...photoMutations, projectMutation];
  const result = await createDocuments(allMutations);
  console.log(`   ✅ Done — ${result.results.length} documents created`);
}

async function main() {
  if (!TOKEN) {
    console.error("SANITY_WRITE_TOKEN not set in .env.local");
    process.exit(1);
  }
  console.log(`Sanity: ${PROJECT_ID} / ${DATASET}`);

  const imagesDir = join(process.cwd(), "public", "images");
  const folders = (await readdir(imagesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`${folders.length} project folders to upload.`);

  for (const folder of folders) {
    await processFolder(folder.name, join(imagesDir, folder.name));
  }

  console.log("\n🎉 All uploads complete!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
