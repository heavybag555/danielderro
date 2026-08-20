import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site-metadata";

export const alt = `${SITE_NAME} — No School Studios`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card. Deliberately the same flat black canvas and Helvetica the site
 * uses, rather than a photograph — the work is the photography, and a crop of
 * one project would misrepresent the rest.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          padding: 72,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ce0000",
            }}
          />
          <div style={{ color: "#ffffff", fontSize: 30, letterSpacing: -0.5 }}>
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            fontSize: 62,
            lineHeight: 1.15,
            letterSpacing: -1.5,
          }}
        >
          <div>No School Studios is a visual practice.</div>
          <div style={{ color: "#808080" }}>
            Founded and operated by Daniel Derro.
          </div>
          <div style={{ color: "#808080" }}>Based in Venice.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
