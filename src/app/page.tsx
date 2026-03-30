import SiteFooter from "@/components/SiteFooter";
import InfoColumns from "@/components/InfoColumns";
import GallerySection from "@/components/GallerySection";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        paddingTop: 400,
        paddingLeft: 12,
        paddingRight: 12,
        /* Clear tall fixed footer (bar + horizontal padding) */
        paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
        gap: 10,
      }}
    >
      {/* Main content stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
        {/*
          One section wraps hero+info and gallery so sticky InfoColumns stays within a tall
          parent and can pin flush to the viewport (top: 0) while the gallery scrolls.
        */}
        <section style={{ paddingTop: 120, paddingBottom: 0 }}>
          <InfoColumns stickyTextBlock hideContact />
          <div style={{ marginTop: 240 }}>
            <GallerySection />
          </div>
        </section>

        {/* Bottom info section (NOT sticky) */}
        <section
          style={{
            paddingTop: 120,
            paddingBottom: 120,
          }}
        >
          <InfoColumns hideAboutClients />
        </section>
      </div>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
