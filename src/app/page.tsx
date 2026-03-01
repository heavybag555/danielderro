"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function Pill({
  bg,
  color,
  children,
  className = "",
}: {
  bg: string;
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center pt-[4px] pb-[2px] pl-[4px] pr-[4px] text-display font-medium ${bg} ${color} ${className}`}
    >
      {children}
    </span>
  );
}

const container = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease },
  },
};

export default function Home() {
  return (
    <motion.main
      className="h-svh flex flex-col p-6 overflow-hidden"
      variants={container}
      initial="initial"
      animate="animate"
    >
      {/* Three-column layout */}
      <div className="flex flex-1 min-h-0 gap-[10px]">
        {/* Left column — pills at top */}
        <motion.div
          className="flex-1 self-start flex items-start"
          variants={item}
        >
          <Pill bg="bg-primary" color="text-muted">
            Daniel Derro
          </Pill>
          <Pill bg="bg-muted" color="text-primary">
            danielderro@gmail.com
          </Pill>
        </motion.div>

        {/* Center column — bio vertically centered */}
        <motion.div
          className="flex-1 self-stretch flex items-center justify-center"
          variants={item}
        >
          <div className="flex flex-col gap-6 w-full items-center">
            <span className="text-label text-muted">
              DD–01
            </span>
            <div className="text-body text-muted w-[400px]">
              <p>
                Daniel Derro creates visual narratives for luxury fashion and
                cultural brands, bringing authentic street perspective to
                premium campaigns. His work for <span className="underline">Prada</span>, <span className="underline">Dior</span>, and <span className="underline">Givenchy</span>
                demonstrates his ability to translate genuine cultural moments
                into compelling luxury brand stories.
              </p>
              <p className="mt-[1.41em]">
                Recent campaigns span major fashion houses, international
                sportswear brands, and music industry collaborations. Daniel has
                directed album visuals for Grammy-nominated artist <span className="underline">Giveon</span> while
                maintaining ongoing relationships with <span className="underline">Nike</span> and <span className="underline">Adidas</span> for
                culturally-driven campaigns.
              </p>
              <p className="mt-[1.41em]">
                Published extensively in <span className="underline">The New York Times</span>, <span className="underline">Vogue Italia</span>, <span className="underline">i-D</span>,
                and <span className="underline">Kaleidoscope Magazine</span>, Daniel&apos;s editorial work has been
                exhibited internationally from <span className="underline">Dover Street Market Paris</span> to <span className="underline">MOMA</span>
                and <span className="underline">MOCA</span> museums. His visual language combines documentary
                authenticity with luxury fashion aesthetics.
              </p>
              <p className="mt-[1.41em]">
                Daniel&apos;s comprehensive services include photography, film
                direction, creative direction, casting, location scouting, and
                brand consulting. Working primarily with medium format film and
                high-end digital capture, he delivers complete creative
                solutions from concept through final delivery.
              </p>
              <p className="mt-[1.41em]">
                His artistic practice centers on social connection and community
                engagement, including work within correctional facilities and
                youth mentorship programs. This of human experience brings
                genuine authenticity to commercial work, creating campaigns that
                resonate beyond surface aesthetics.
              </p>
              <p className="mt-[1.41em]">
                Based between New York and Los Angeles with international
                project capabilities.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right column — @handle at top-right */}
        <motion.div
          className="flex-1 self-start flex justify-end"
          variants={item}
        >
          <Pill bg="bg-muted" color="text-primary">
            @danielderro
          </Pill>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer className="flex flex-col items-center" variants={item}>
        <Pill bg="bg-muted" color="text-primary">
          Tel. 00 32 15 75 59 43
        </Pill>
        <Pill bg="bg-primary" color="text-subtle">
          Venice
        </Pill>
      </motion.footer>
    </motion.main>
  );
}
