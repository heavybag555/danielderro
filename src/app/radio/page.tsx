import RadioPageClient from "@/components/RadioPageClient";
import { resolveMixcloudStreamUrl } from "@/lib/mixcloud-stream";
import { RADIO_EPISODES, RADIO_INTRO } from "@/lib/site-content";

export default async function RadioPage() {
  const episodes = await Promise.all(
    RADIO_EPISODES.map(async (episode) => ({
      ...episode,
      streamSrc: (await resolveMixcloudStreamUrl(episode.mixcloudUrl)) ?? undefined,
    })),
  );

  return <RadioPageClient intro={RADIO_INTRO} episodes={episodes} />;
}
