"use client";

import { usePathname } from "next/navigation";
import SiteBrandStrip from "@/components/SiteBrandStrip";

function useHeaderBlend(pathname: string): boolean {
  // Home and project detail (full-bleed slides) use exclusion blend over photography.
  if (pathname === "/") return true;
  if (pathname.startsWith("/work/") && pathname.length > "/work/".length) return true;
  return false;
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBrandStrip = !pathname.startsWith("/studio");
  const blendOverlay = useHeaderBlend(pathname);
  return (
    <>
      {showBrandStrip ? <SiteBrandStrip blendOverlay={blendOverlay} /> : null}
      {children}
    </>
  );
}
