"use client";

import { usePathname } from "next/navigation";
import SiteBrandStrip from "@/components/SiteBrandStrip";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBrandStrip = !pathname.startsWith("/studio");
  return (
    <>
      {showBrandStrip ? <SiteBrandStrip blendOverlay={pathname === "/"} /> : null}
      {children}
    </>
  );
}
