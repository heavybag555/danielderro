import { Suspense } from "react";
import RadioPageClient from "@/components/RadioPageClient";
import SiteBackgroundVideo from "@/components/SiteBackgroundVideo";
import { resolveMixcloudStreamUrl } from "@/lib/mixcloud-stream";
import { RADIO_EPISODES } from "@/lib/site-content";

export default async function RadioPage() {
  const episodes = await Promise.all(
    RADIO_EPISODES.map(async (episode) => ({
      ...episode,
      streamSrc: (await resolveMixcloudStreamUrl(episode.mixcloudUrl)) ?? undefined,
    })),
  );

  return (
    <>
      <SiteBackgroundVideo fixed dimmed />
      {/* The client reads the selected episode from the query string. */}
      <Suspense fallback={null}>
        <RadioPageClient episodes={episodes} />
      </Suspense>
    </>
  );
}
