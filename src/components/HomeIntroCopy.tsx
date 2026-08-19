import { HERO_STACK_PORTRAIT, SITE_ABOUT_COPY, SITE_CLIENTS_COPY } from "@/lib/site-content";

export default function HomeIntroCopy() {
  return (
    <section className="home-intro-copy">
      <div className="layout-grid w-full items-start">
        <div className="home-intro-copy-inner content-compact flex flex-col gap-[40px]">
          <div className="flex flex-col gap-0">
            <h2 className="home-intro-copy-title text-semantic-title pl-5 m-0">About</h2>
            <p className="text-small m-0" style={{ color: "var(--color-primary)" }}>
              {SITE_ABOUT_COPY}
            </p>
          </div>

          <div className="flex flex-col gap-0">
            <h2 className="home-intro-copy-title text-semantic-title pl-5 m-0">Clients</h2>
            <p className="text-small m-0" style={{ color: "var(--color-primary)" }}>
              {SITE_CLIENTS_COPY}
            </p>
          </div>
        </div>

        <div className="home-intro-image-wrap">
          <img
            src={HERO_STACK_PORTRAIT.src}
            alt={HERO_STACK_PORTRAIT.alt}
            width={HERO_STACK_PORTRAIT.width}
            height={HERO_STACK_PORTRAIT.height}
            className="home-intro-image"
          />
          <div className="hero-grain" aria-hidden />
        </div>
      </div>
    </section>
  );
}
