import RadioPlayer from "@/components/RadioPlayer";
import { resolveMixcloudStreamUrl } from "@/lib/mixcloud-stream";
import { RADIO_EPISODES } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const KNOWN_GOOD =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export default async function RadioLabPage() {
  const mixcloud = await Promise.all(
    RADIO_EPISODES.map(async (episode) => ({
      label: episode.title,
      url: episode.mixcloudUrl,
      streamSrc: (await resolveMixcloudStreamUrl(episode.mixcloudUrl)) ?? null,
    })),
  );

  const cases: { label: string; src: string | null; note?: string }[] = [
    { label: "Known-good MP3 (SoundHelix)", src: KNOWN_GOOD, note: "baseline sanity check" },
    ...mixcloud.map((m) => ({ label: m.label, src: m.streamSrc, note: m.url })),
  ];

  return (
    <main
      className="layout-full"
      style={{ minHeight: "100dvh", background: "#000", color: "#fff", paddingBlock: 48 }}
    >
      <div className="content-wide" style={{ display: "grid", gap: 56 }}>
        <header style={{ display: "grid", gap: 8 }}>
          <h1 style={{ font: "600 20px/1.2 var(--font-sans)", margin: 0 }}>Radio Player Lab</h1>
          <p style={{ font: "400 13px/1.5 var(--font-sans)", opacity: 0.6, margin: 0 }}>
            Isolated test bench for the native-audio player. Each row uses the same
            component as production. The first is a known-good MP3 to prove the
            component itself works; the rest are live Mixcloud streams.
          </p>
        </header>

        {cases.map((c, i) => (
          <section key={i} style={{ display: "grid", gap: 12 }}>
            <div style={{ font: "600 13px/1.3 var(--font-sans)" }}>{c.label}</div>
            {c.note ? (
              <div style={{ font: "400 11px/1.4 var(--font-sans)", opacity: 0.5, wordBreak: "break-all" }}>
                {c.note}
              </div>
            ) : null}

            {c.src ? (
              <>
                <RadioPlayer src={c.src} />
                <details style={{ font: "400 11px/1.4 var(--font-sans)", opacity: 0.5 }}>
                  <summary style={{ cursor: "pointer" }}>raw &lt;audio controls&gt; fallback</summary>
                  <audio
                    controls
                    preload="metadata"
                    src={c.src}
                    style={{ width: "100%", marginTop: 8 }}
                  />
                  <div style={{ marginTop: 8, wordBreak: "break-all" }}>{c.src}</div>
                </details>
              </>
            ) : (
              <div style={{ font: "400 12px/1.4 var(--font-sans)", color: "#ff6b6b" }}>
                stream did not resolve
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
