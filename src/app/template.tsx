"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: MOTION.duration.page,
        ease: MOTION.ease.heavy,
      }}
    >
      {children}
    </motion.div>
  );
}
