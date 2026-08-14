"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionDurations, motionEase } from "@/lib/motion/tokens";

/**
 * The atmosphere is scenery, never content. It is deliberately limited to two
 * transform-only drifts so it remains almost imperceptible and inexpensive.
 */
export function Atmosphere() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 isolate overflow-hidden">
      <div className="absolute inset-0 z-background bg-[radial-gradient(circle_at_52%_-16%,rgba(255,255,255,.98),rgba(248,247,243,.94)_45%,rgba(240,237,231,.9)_100%)] [html[data-theme=night]_&]:bg-[radial-gradient(circle_at_52%_-12%,rgba(86,63,54,.62),rgba(25,18,17,.97)_56%,rgba(18,13,15,1)_100%)]" />
      <motion.div
        className="absolute -left-[20vw] top-[2vh] z-atmosphere h-[44vh] w-[60vw] rounded-full bg-mist-cyan/14 blur-3xl will-change-transform [html[data-theme=night]_&]:bg-mist-cyan/[.08]"
        animate={reducedMotion ? undefined : { x: [0, 9, -3, 0], y: [0, -5, 3, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 12, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute -right-[18vw] top-[26vh] z-atmosphere hidden h-[36vh] w-[46vw] rounded-full bg-mist-lavender/12 blur-3xl will-change-transform sm:block [html[data-theme=night]_&]:bg-mist-blush/[.07]"
        animate={reducedMotion ? undefined : { x: [0, -7, 4, 0], y: [0, 4, -2, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 20, repeat: Infinity, ease: motionEase.dream }}
      />
      <div className="absolute inset-x-[10vw] top-[14vh] z-ambient h-px bg-gradient-to-r from-transparent via-white/35 to-transparent [html[data-theme=night]_&]:via-white/[.08]" />
    </div>
  );
}
