"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { animate } from "animejs";

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

type Props = {
  collaboratorImages: Record<string, string>;
};

export default function HomeClient({ collaboratorImages }: Props) {
  const [expanded, setExpanded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    Object.values(collaboratorImages).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [collaboratorImages]);

  const showPreview = useCallback(
    (imageUrl: string, e: React.MouseEvent) => {
      const el = previewRef.current;
      const img = imgRef.current;
      if (!el || !img) return;

      img.src = imageUrl;
      el.style.left = `${e.clientX + 16}px`;
      el.style.top = `${e.clientY - 16}px`;

      document.documentElement.style.cursor = "crosshair";

      if (!visibleRef.current) {
        visibleRef.current = true;
        el.style.display = "block";
        animate(el, {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 280,
          ease: "outQuad",
        });
      } else {
        visibleRef.current = true;
      }
    },
    [],
  );

  const hidePreview = useCallback(() => {
    const el = previewRef.current;
    if (!el || !visibleRef.current) return;

    visibleRef.current = false;
    document.documentElement.style.cursor = "";

    animate(el, {
      opacity: 0,
      translateY: 6,
      duration: 220,
      ease: "inQuad",
      onComplete: () => {
        if (!visibleRef.current && el) {
          el.style.display = "none";
        }
      },
    });
  }, []);

  const movePreview = useCallback((e: React.MouseEvent) => {
    if (!previewRef.current || !visibleRef.current) return;
    previewRef.current.style.left = `${e.clientX + 16}px`;
    previewRef.current.style.top = `${e.clientY - 16}px`;
  }, []);

  function cl(name: string) {
    const imageUrl = collaboratorImages[name];
    return (
      <span
        className="underline"
        onMouseEnter={
          imageUrl ? (e: React.MouseEvent) => showPreview(imageUrl, e) : undefined
        }
        onMouseLeave={imageUrl ? hidePreview : undefined}
        onMouseMove={imageUrl ? movePreview : undefined}
      >
        {name}
      </span>
    );
  }

  return (
    <>
      <motion.main
        className="min-h-svh flex flex-col p-5 sm:p-3 pb-28 sm:pb-24 overflow-x-hidden"
        variants={container}
        initial="initial"
        animate="animate"
      >
        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6 md:gap-[10px]">
          <motion.div
            className="md:flex-1 self-start flex items-start flex-wrap gap-0"
            variants={item}
          >
            <Pill bg="bg-muted" color="text-primary">
              Daniel Derro
            </Pill>
            <a
              href="mailto:info@ns-sr.org"
              className="inline-flex"
            >
              <Pill
                bg="bg-white"
                color="text-muted"
                className="hover:bg-muted hover:text-primary"
              >
                info@ns-sr.org
              </Pill>
            </a>
          </motion.div>

          <motion.div
            className="md:flex-1 self-start flex md:justify-end md:order-last"
            variants={item}
          >
            <a
              href="https://www.instagram.com/danielderro_/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Pill
                bg="bg-white"
                color="text-muted"
                className="hover:bg-muted hover:text-primary"
              >
                @danielderro_
              </Pill>
            </a>
          </motion.div>

          <motion.div
            className="md:flex-1 md:self-stretch flex items-center justify-center"
            variants={item}
          >
            <div className="flex flex-col gap-6 w-full items-center max-w-[400px]">
              <span className="text-label text-muted self-center">DD–01</span>
              <div className="text-body text-muted w-full max-w-[400px] text-justify [&>p:last-child]:text-left">
                <p className="indent-16">
                  Daniel Derro creates visual narratives for luxury fashion and
                  cultural brands, bringing authentic street perspective to
                  premium campaigns. His work for {cl("Prada")},{" "}
                  {cl("Nike")}, {cl("Givenchy")}, and {cl("Dior")} — alongside
                  collaborations with {cl("Stüssy")}, {cl("Adidas")},{" "}
                  {cl("pgLang")}, {cl("Burberry")}, {cl("Carhartt WIP")},{" "}
                  {cl("Our Legacy")}, and {cl("New Balance")} — demonstrates his
                  ability to translate genuine cultural moments into compelling
                  luxury brand stories.
                </p>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="bio-expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-[1.41em]">
                        Recent campaigns span major fashion houses, leading sportswear
                        innovators, and influential streetwear and cultural platforms.
                        Daniel has directed album visuals for Grammy-nominated artist{" "}
                        {cl("Giveon")} while maintaining ongoing relationships with{" "}
                        {cl("Nike")}, {cl("Adidas")}, {cl("New Balance")},{" "}
                        {cl("Stüssy")}, and {cl("pgLang")} for culturally-driven
                        campaigns.
                      </p>
                      <p className="mt-[1.41em]">
                        Published extensively in leading international fashion and
                        culture outlets, Daniel&apos;s editorial work has been
                        exhibited internationally from{" "}
                        {cl("Dover Street Market Paris")} to major contemporary art
                        museums. His visual language combines documentary authenticity
                        with luxury fashion aesthetics.
                      </p>
                      <p className="mt-[1.41em]">
                        Daniel&apos;s comprehensive services include photography, film
                        direction, creative direction, casting, location scouting, and
                        brand consulting. Working primarily with medium format film and
                        high-end digital capture, he delivers complete creative
                        solutions from concept through final delivery.
                      </p>
                      <p className="mt-[1.41em]">
                        His artistic practice centers on social connection and
                        community engagement, including work within correctional
                        facilities and youth mentorship programs. This depth of human
                        experience brings genuine authenticity to commercial work,
                        creating campaigns that resonate beyond surface aesthetics.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-[1.41em]">
                  Based between New York and Los Angeles with international
                  project capabilities.
                </p>

              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-[6px] self-center text-label text-muted cursor-pointer transition-colors duration-300 hover:underline"
              >
                {expanded ? "LESS" : "MORE"}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.footer
          className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center"
          variants={item}
        >
          <Pill bg="bg-white" color="text-muted">
            Tel. 00 32 15 75 59 43
          </Pill>
          <Pill bg="bg-muted" color="text-primary">
            Venice
          </Pill>
        </motion.footer>
      </motion.main>

      <div
        ref={previewRef}
        className="fixed pointer-events-none z-50"
        style={{ display: "none", opacity: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt=""
          style={{ width: 200, display: "block" }}
        />
      </div>
    </>
  );
}
