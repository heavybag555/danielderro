"use client";

import SiteBackgroundVideo from "@/components/SiteBackgroundVideo";

export default function HomeHero() {
  return (
    <main id="main-content" data-home-hero className="overflow-hidden">
      <SiteBackgroundVideo />

      <h1 className="visually-hidden">No School Studios — Daniel Derro</h1>

      <div className="home-hero-center">
        <p className="home-hero-center-titles content-compact text-small">
          <span className="home-hero-name">No School Studios</span> is a visual practice.
          <br />
          Founded and operated by <span className="home-hero-name">Daniel Derro</span>.
          <br />
          Based in Venice.
        </p>
      </div>
    </main>
  );
}
