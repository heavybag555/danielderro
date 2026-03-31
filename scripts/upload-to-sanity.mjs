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

function parseClient(folderName) {
  const match = folderName.match(/^(.+?)\s*x\s+(.+)$/i);
  if (match) return match[1].trim();
  return folderName;
}

async function processFolder(folderName, folderPath, order) {
  console.log(`\n📁 ${folderName}`);

  const imageFiles = await getImageFiles(folderPath);
  if (imageFiles.length === 0) {
    console.log(`   ⚠ No images, skipping.`);
    return;
  }
  console.log(`   ${imageFiles.length} images`);

  const galleryItems = [];
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

      galleryItems.push({
        _type: "imageAsset",
        _key: `img-${i}`,
        image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
        caption: file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim(),
        alt: `${folderName} — image ${i + 1}`,
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  if (galleryItems.length === 0) return;

  const slug = slugify(folderName);
  const projectId = `project-${slug}`;
  const client = parseClient(folderName);

  console.log(`   Creating project "${folderName}" with ${galleryItems.length} gallery images...`);

  const mutation = {
    createOrReplace: {
      _id: projectId,
      _type: "project",
      title: folderName,
      slug: { _type: "slug", current: slug },
      client,
      projectType: "photography",
      tags: [],
      coverImage: coverAssetId
        ? { _type: "image", asset: { _type: "reference", _ref: coverAssetId } }
        : undefined,
      gallery: galleryItems,
      order,
    },
  };

  const result = await createDocuments([mutation]);
  console.log(`   ✅ Done — project created (${result.results.length} doc)`);
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

  for (let i = 0; i < folders.length; i++) {
    await processFolder(folders[i].name, join(imagesDir, folders[i].name), i);
  }

  console.log("\n🎉 All uploads complete!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
