"use client";

import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import SiteBrandStrip from "@/components/SiteBrandStrip";

function useHeaderBlend(pathname: string): boolean {
  // Home, info, radio, and project detail use exclusion blend over photography / video.
  if (pathname === "/") return true;
  if (pathname === "/info") return true;
  if (pathname === "/radio") return true;
  if (pathname.startsWith("/work/") && pathname.length > "/work/".length) return true;
  return false;
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBrandStrip = !pathname.startsWith("/studio");
  const blendOverlay = useHeaderBlend(pathname);
  return (
    // `reducedMotion="user"` makes every motion component below honour the OS
    // setting, instead of each one wiring up useReducedMotion by hand.
    <MotionConfig reducedMotion="user">
      {showBrandStrip ? <SiteBrandStrip blendOverlay={blendOverlay} /> : null}
      {children}
    </MotionConfig>
  );
}
