const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const API_VERSION = process.env.SANITY_API_VERSION || "2026-03-01";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const API = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;
const MAX_PHOTOS = 20;

async function query(groq) {
  const url = `${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Query failed ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
}

async function mutate(mutations) {
  const res = await fetch(`${API}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Mutate failed: ${await res.text()}`);
  return res.json();
}

async function main() {
  const projects = await query('*[_type=="project"]{_id, name, "photoCount": count(photos), "photos": photos[]._ref}');
  const overLimit = projects.filter((p) => p.photoCount > MAX_PHOTOS);

  if (overLimit.length === 0) {
    console.log(`All projects have ${MAX_PHOTOS} or fewer photos.`);
    return;
  }

  console.log(`${overLimit.length} project(s) exceed ${MAX_PHOTOS} photos:\n`);

  for (const project of overLimit) {
    const keep = project.photos.slice(0, MAX_PHOTOS);
    const remove = project.photos.slice(MAX_PHOTOS);
    console.log(`${project.name}: ${project.photos.length} → ${MAX_PHOTOS} (removing ${remove.length})`);

    const trimmedRefs = keep.map((ref, i) => ({ _type: "reference", _ref: ref, _key: `ref-${i}` }));

    // Step 1: Patch published + draft project to remove excess refs
    const patchMutations = [
      { patch: { id: project._id, set: { photos: trimmedRefs } } },
      { patch: { id: `drafts.${project._id}`, ifRevisionID: undefined, set: { photos: trimmedRefs } } },
    ];

    try {
      await mutate(patchMutations);
      console.log(`   Patched project refs`);
    } catch (e) {
      // Draft might not exist, try just the published one
      await mutate([patchMutations[0]]);
      console.log(`   Patched project refs (no draft)`);
    }

    // Step 2: Delete orphaned photo docs + their assets
    const deleteMutations = [];
    for (const ref of remove) {
      const photo = await query(`*[_id=="${ref}"]{_id, "assetRef": image.asset._ref}[0]`);
      if (photo) {
        deleteMutations.push({ delete: { id: photo._id } });
        if (photo.assetRef) deleteMutations.push({ delete: { id: photo.assetRef } });
      }
    }

    if (deleteMutations.length > 0) {
      const result = await mutate(deleteMutations);
      console.log(`   ✅ Deleted ${result.results.length} docs (photos + assets)`);
    }
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
