"use client";

import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import SiteBrandStrip from "@/components/SiteBrandStrip";

function useHeaderBlend(pathname: string): boolean {
  // Surfaces with photography / video under the brand: exclusion so the name
  // and desktop nav invert like the mobile Menu word.
  if (pathname === "/") return true;
  if (pathname === "/info") return true;
  if (pathname === "/radio") return true;
  if (pathname === "/gallery") return true;
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
