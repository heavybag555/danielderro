/** Human-readable label for Sanity tag values (e.g. `no-school-studio`). */
export function formatSanityTag(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
