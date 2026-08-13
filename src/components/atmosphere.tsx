"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionDurations, motionEase } from "@/lib/motion/tokens";

export function Atmosphere() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 isolate overflow-hidden">
      <div className="absolute inset-0 z-background bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,.98),rgba(250,250,247,.92)_42%,rgba(243,241,237,.82)_100%)]" />

      <motion.div
        className="absolute -left-[12vw] top-[4vh] z-atmosphere h-[46vh] w-[46vw] rounded-full bg-mist-cyan/30 blur-3xl will-change-transform"
        animate={reducedMotion ? undefined : { x: [0, 16, -6, 0], y: [0, -10, 6, 0] }}
        transition={{ duration: motionDurations.ambientSlower, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute right-[-18vw] top-[14vh] z-atmosphere h-[58vh] w-[48vw] rounded-full bg-mist-lavender/28 blur-3xl will-change-transform"
        animate={reducedMotion ? undefined : { x: [0, -14, 8, 0], y: [0, 12, -4, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 6, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute bottom-[-18vh] left-[24vw] z-atmosphere h-[44vh] w-[42vw] rounded-full bg-mist-champagne/30 blur-3xl will-change-transform"
        animate={reducedMotion ? undefined : { x: [0, 10, -8, 0], y: [0, -8, 10, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 10, repeat: Infinity, ease: motionEase.dream }}
      />

      <motion.div
        className="absolute left-[12vw] top-[28vh] z-ambient hidden h-36 w-36 rounded-[42%_58%_54%_46%] bg-white/24 shadow-soft backdrop-blur-2xl will-change-transform sm:block"
        animate={reducedMotion ? undefined : { y: [0, -7, 0], rotate: [0, 2, 0] }}
        transition={{ duration: motionDurations.ambientSlow, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute right-[14vw] top-[55vh] z-ambient hidden h-48 w-28 rounded-[48%_52%_62%_38%] bg-white/18 shadow-soft backdrop-blur-2xl will-change-transform md:block"
        animate={reducedMotion ? undefined : { y: [0, 8, 0], rotate: [0, -2, 0] }}
        transition={{ duration: motionDurations.ambientSlow + 4, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute left-[50vw] top-[16vh] z-ambient hidden h-24 w-52 rounded-full bg-white/14 shadow-soft backdrop-blur-2xl will-change-transform lg:block"
        animate={reducedMotion ? undefined : { x: [0, 6, 0], y: [0, -5, 0] }}
        transition={{ duration: motionDurations.ambientSlow + 8, repeat: Infinity, ease: motionEase.dream }}
      />

      <div className="absolute inset-x-0 top-0 z-ambient h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="absolute left-[8vw] top-[9vh] z-ambient hidden h-[1px] w-[84vw] rotate-[-8deg] animate-fine-shimmer bg-gradient-to-r from-transparent via-mist-lavender/28 to-transparent sm:block" />
      <div className="absolute left-[18vw] top-[72vh] z-ambient hidden h-[1px] w-[62vw] rotate-[5deg] animate-fine-shimmer bg-gradient-to-r from-transparent via-mist-cyan/24 to-transparent md:block" />
    </div>
  );
}
