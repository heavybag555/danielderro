"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { markNavigationOccurred } from "@/lib/nav-state";

/**
 * Mounts once in the root layout (it never unmounts) and flips the global
 * navigation flag the first time the pathname changes away from the initially
 * loaded route. Marking happens during render — and this component sits above
 * the page subtree — so the flag is already correct by the time a destination
 * page (e.g. /work) reads it on mount.
 */
export default function NavWatcher() {
  const pathname = usePathname();
  const firstPath = useRef<string | null>(null);

  if (firstPath.current === null) {
    firstPath.current = pathname;
  } else if (pathname !== firstPath.current) {
    markNavigationOccurred();
  }

  return null;
}
