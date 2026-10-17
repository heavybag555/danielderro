import {
  buildLlmsFullText,
  fetchLlmsProjects,
  LLMS_CONTENT_TYPE,
} from "@/lib/llms-text";

// Prerendered at build time and refreshed daily, so agents are served from cache.
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const projects = await fetchLlmsProjects();

  return new Response(buildLlmsFullText(projects), {
    headers: { "Content-Type": LLMS_CONTENT_TYPE },
  });
}
