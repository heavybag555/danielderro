const TAG_LABELS: Record<string, string> = {
  editorial: "Editorial",
  campaign: "Campaign",
};

/** Commissioning client, or the body of work a row belongs to. */
export function projectClientLabel(project: {
  client?: string;
  tags?: string[];
}): string {
  const client = project.client?.trim();
  if (client) return client;
  if (project.tags?.includes("no-school-studio")) return "No School Studio";
  return "Personal";
}

/** Caption tags: Editorial / Campaign plus Stills or Motion. */
export function projectTagsLabel(project: {
  tags?: string[];
  projectType?: string;
}): string {
  const labels: string[] = [];
  for (const tag of project.tags ?? []) {
    const label = TAG_LABELS[tag];
    if (label) labels.push(label);
  }
  if (project.projectType === "photography") labels.push("Stills");
  else if (project.projectType === "video") labels.push("Motion");
  else if (project.projectType) {
    labels.push(
      project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1),
    );
  }
  return labels.join(", ");
}
