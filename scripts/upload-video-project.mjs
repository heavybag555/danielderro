/**
 * Upload a local video as a Sanity `project` (video gallery slide + poster).
 *
 * Usage:
 *   node scripts/upload-video-project.mjs \
 *     --file "/path/to/video.mp4" \
 *     --title "The Sum of Many : Trailer" \
 *     --tag no-school
 *
 * Optional: --client "…"  --date YYYY-MM-DD  --slug custom-slug  --poster /path/to.jpg
 * Requires SANITY_WRITE_TOKEN in .env.local
 */

import { createReadStream, readFileSync, existsSync } from "fs";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { basename, extname, join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createClient } from "@sanity/client";

const execFileAsync = promisify(execFile);

try {
  const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const API_VERSION = process.env.SANITY_API_VERSION || "2026-03-01";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

const TAG_ALIASES = {
  "no-school": "no-school-studio",
  "no-school-studio": "no-school-studio",
  nss: "no-school-studio",
  editorial: "editorial",
  campaign: "campaign",
  personal: "personal",
};

function parseArgs(argv) {
  const out = { tags: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--file" && next) out.file = next;
    else if (arg === "--title" && next) out.title = next;
    else if (arg === "--client" && next) out.client = next;
    else if (arg === "--date" && next) out.date = next;
    else if (arg === "--slug" && next) out.slug = next;
    else if (arg === "--poster" && next) out.poster = next;
    else if (arg === "--tag" && next) out.tags.push(next);
    else continue;
    i += 1;
  }
  return out;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveTags(raw) {
  const tags = [];
  for (const value of raw) {
    const key = value.trim().toLowerCase();
    const mapped = TAG_ALIASES[key] ?? key;
    if (mapped && !tags.includes(mapped)) tags.push(mapped);
  }
  return tags;
}

function mimeForVideo(ext) {
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  if (ext === ".m4v") return "video/x-m4v";
  return "video/mp4";
}

function mimeForImage(ext) {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function extractPoster(videoPath, destPath) {
  await execFileAsync("ffmpeg", [
    "-y",
    "-ss",
    "8",
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    destPath,
  ]);
}

async function main() {
  if (!PROJECT_ID || !TOKEN) {
    console.error("SANITY_PROJECT_ID / SANITY_WRITE_TOKEN not set in .env.local");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  if (!args.file || !args.title) {
    console.error("Required: --file <path> --title <title>");
    process.exit(1);
  }
  if (!existsSync(args.file)) {
    console.error(`File not found: ${args.file}`);
    process.exit(1);
  }

  const title = args.title.trim();
  const slug = args.slug ? slugify(args.slug) : slugify(title);
  const tags = resolveTags(args.tags);
  const clientName = args.client?.trim() || undefined;
  const date = args.date?.trim() || undefined;
  const videoExt = extname(args.file).toLowerCase() || ".mp4";
  const videoFilename = `${slug}${videoExt}`;

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: TOKEN,
    useCdn: false,
  });

  const existing = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{ _id, title }`,
    { slug },
  );
  if (existing) {
    console.log(`Updating existing project ${existing._id} ("${existing.title}")`);
  }

  const tmp = await mkdtemp(join(tmpdir(), "dd-video-"));
  const posterPath = args.poster || join(tmp, `${slug}.jpg`);

  try {
    if (!args.poster) {
      console.log("Extracting poster frame…");
      await extractPoster(args.file, posterPath);
    }

    console.log(`Uploading video ${videoFilename}…`);
    const videoAsset = await client.assets.upload("file", createReadStream(args.file), {
      filename: videoFilename,
      contentType: mimeForVideo(videoExt),
    });
    console.log(`  video ${videoAsset._id}`);

    const posterExt = extname(posterPath).toLowerCase() || ".jpg";
    console.log("Uploading poster…");
    const posterAsset = await client.assets.upload(
      "image",
      createReadStream(posterPath),
      {
        filename: `${slug}${posterExt}`,
        contentType: mimeForImage(posterExt),
      },
    );
    console.log(`  poster ${posterAsset._id}`);

    const imageRef = {
      _type: "image",
      asset: { _type: "reference", _ref: posterAsset._id },
    };

    const doc = {
      _id: existing?._id ?? `project-${slug}`,
      _type: "project",
      title,
      slug: { _type: "slug", current: slug },
      ...(clientName ? { client: clientName } : {}),
      projectType: "video",
      tags,
      ...(date ? { date } : {}),
      coverImage: imageRef,
      gallery: [
        {
          _type: "videoAsset",
          _key: "video-0",
          title,
          videoFile: {
            _type: "file",
            asset: { _type: "reference", _ref: videoAsset._id },
          },
          thumbnail: imageRef,
        },
      ],
    };

    const result = await client.createOrReplace(doc);
    console.log(`Created project ${result._id}`);
    console.log(`  /work/${slug}`);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
