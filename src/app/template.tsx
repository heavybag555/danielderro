"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Gallery's dome is a preserve-3d scene. An ancestor opacity fade flattens
  // that context, so the bulge would pop in only after the page transition.
  if (pathname.startsWith("/studio") || pathname === "/gallery") {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        // Reduced motion should not also mean a delay before content shows.
        duration: reduceMotion ? 0 : MOTION.duration.page,
        ease: MOTION.ease.heavy,
      }}
    >
      {children}
    </motion.div>
  );
}
