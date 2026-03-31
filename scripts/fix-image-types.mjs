/**
 * One-time migration: converts gallery entries with _type "image"
 * (created by a brief schema change) back to _type "imageAsset"
 * so they match the current schema definition.
 *
 * Usage:  node scripts/fix-image-types.mjs
 * Requires SANITY_WRITE_TOKEN in .env.local
 */

import { readFileSync } from "fs";

// Load .env.local the same way the upload script does (no dotenv dep)
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
const API = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;

if (!TOKEN) {
  console.error("SANITY_WRITE_TOKEN not set");
  process.exit(1);
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

async function mutate(mutations) {
  return sanityFetch(`/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
}

const query = encodeURIComponent(
  `*[_type == "project" && defined(gallery)] {
    _id,
    "badItems": gallery[_type == "image"] { _key, asset }
  }[count(badItems) > 0]`
);

console.log(`Scanning projects for gallery items with _type "image"…\n`);

const { result: projects } = await sanityFetch(
  `/data/query/${DATASET}?query=${query}`
);

if (projects.length === 0) {
  console.log("No orphaned _type:image gallery items found. Nothing to fix.");
  process.exit(0);
}

let totalFixed = 0;

for (const project of projects) {
  console.log(
    `Project ${project._id}: ${project.badItems.length} item(s) to convert`
  );

  const mutations = [];

  for (const item of project.badItems) {
    // Unset the old bare-image entry and insert a proper imageAsset entry
    // We use individual patches keyed by _key within the gallery array.
    mutations.push({
      patch: {
        id: project._id,
        set: {
          [`gallery[_key=="${item._key}"]`]: {
            _key: item._key,
            _type: "imageAsset",
            image: {
              _type: "image",
              asset: item.asset,
            },
            caption: "",
            alt: "",
          },
        },
      },
    });
  }

  const result = await mutate(mutations);
  const patched = result.results?.filter((r) => r.operation === "update").length ?? 0;
  console.log(`  → Patched ${patched} document(s)`);
  totalFixed += project.badItems.length;
}

console.log(`\nDone — converted ${totalFixed} gallery item(s) from "image" → "imageAsset".`);
