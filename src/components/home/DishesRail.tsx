"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import CssSlab from "./CssSlab";

const DISHES = [
  {
    name: "Prime Ribeye & Wagyu",
    tone: "hot",
    temp: "450°F",
    time: "45–60 sec a side",
    body: "Sear thin strips at the table. Dry heat caramelizes the marbling while minerals season the crust.",
  },
  {
    name: "Sea Scallops & Salmon",
    tone: "hot",
    temp: "450°F",
    time: "2 min sear",
    body: "Dry diver scallops form a golden crust with crisp, savory sweetness. No table salt required.",
  },
  {
    name: "Beef Carpaccio",
    tone: "cold",
    temp: "0°F",
    time: "Served chilled",
    body: "Paper-thin tenderloin, olive oil and fresh herbs. The frozen slab gently cures the underside.",
  },
  {
    name: "Sashimi & Tuna Tartare",
    tone: "cold",
    temp: "0°F",
    time: "90 min cold",
    body: "Silky texture and balanced seasoning, held perfectly chilled right through dinner.",
  },
  {
    name: "Cheese & Charcuterie",
    tone: "cold",
    temp: "0°F",
    time: "Board service",
    body: "A cold mineral board that keeps artisanal cheese and cured meats at their best.",
  },
] as const;

/** Vertical scroll drives a horizontal rail of dish cards while the section is pinned. */
export default function DishesRail() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform([scrollYProgress, distance], ([p, d]: number[]) => -p * d);

  // Size the pinned section so one pixel of vertical scroll moves the rail one pixel.
  useEffect(() => {
    const el = rail.current;
    const sec = section.current;
    if (!el || !sec) return;
    const observer = new ResizeObserver(() => {
      const d = Math.max(0, el.scrollWidth - document.documentElement.clientWidth);
      distance.set(d);
      sec.style.height = `calc(100svh + ${d}px)`;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [distance]);

  return (
    <section id="dishes" ref={section} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-11">
        <div className="mx-auto mb-8 w-full max-w-6xl px-5 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300">Dining inspiration</p>
          <h2 className="mt-3 text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
            What to cook on your slab.
          </h2>
        </div>

        <motion.div ref={rail} style={{ x }} className="flex w-max gap-4 px-5 sm:gap-6 sm:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          {DISHES.map((dish, i) => (
            <article
              key={dish.name}
              className={`relative flex h-[min(62svh,560px)] w-[80vw] shrink-0 flex-col overflow-hidden rounded-4xl border p-6 sm:w-[min(56vw,30rem)] sm:p-8 ${
                dish.tone === "hot"
                  ? "border-orange-500/20 bg-linear-to-b from-[#2a0d06] via-[#120604] to-black"
                  : "border-sky-400/20 bg-linear-to-b from-[#071a2b] via-[#050d16] to-black"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    dish.tone === "hot" ? "bg-orange-500/15 text-orange-300" : "bg-sky-400/15 text-sky-200"
                  }`}
                >
                  {dish.tone === "hot" ? "Hot sear" : "Chilled"} &middot; {dish.temp}
                </span>
                <span className="text-neutral-500 tabular-nums">0{i + 1}</span>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="motion-safe:animate-float" style={{ animationDelay: `${i * -1.2}s` }}>
                  <CssSlab size={150} tone={dish.tone} />
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${dish.tone === "hot" ? "text-orange-300" : "text-sky-300"}`}>{dish.time}</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">{dish.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{dish.body}</p>
              </div>
            </article>
          ))}
        </motion.div>

        <div className="mx-auto mt-8 w-full max-w-6xl px-5 sm:px-6">
          <div className="h-px overflow-hidden bg-white/10">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-linear-to-r from-rose-400 to-amber-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
