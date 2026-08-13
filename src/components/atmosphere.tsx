"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionDurations, motionEase } from "@/lib/motion/tokens";

export function Atmosphere() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 isolate overflow-hidden">
      <div className="absolute inset-0 z-background bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,.98),rgba(250,250,247,.92)_42%,rgba(243,241,237,.8)_100%)] [html[data-theme=night]_&]:bg-[radial-gradient(circle_at_50%_-10%,rgba(81,61,54,.82),rgba(24,18,16,.96)_52%,rgba(18,13,15,1)_100%)]" />
      <motion.div
        className="absolute -left-[16vw] top-[7vh] z-atmosphere h-[44vh] w-[54vw] rounded-full bg-mist-cyan/18 blur-3xl will-change-transform [html[data-theme=night]_&]:opacity-35"
        animate={reducedMotion ? undefined : { x: [0, 10, -4, 0], y: [0, -7, 4, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 8, repeat: Infinity, ease: motionEase.dream }}
      />
      <motion.div
        className="absolute right-[-22vw] top-[18vh] z-atmosphere hidden h-[48vh] w-[48vw] rounded-full bg-mist-lavender/16 blur-3xl will-change-transform sm:block [html[data-theme=night]_&]:opacity-35"
        animate={reducedMotion ? undefined : { x: [0, -9, 5, 0], y: [0, 8, -3, 0] }}
        transition={{ duration: motionDurations.ambientSlower + 15, repeat: Infinity, ease: motionEase.dream }}
      />
      <div className="absolute bottom-[-20vh] left-[28vw] z-atmosphere hidden h-[38vh] w-[40vw] rounded-full bg-mist-champagne/14 blur-3xl sm:block [html[data-theme=night]_&]:opacity-25" />
      <div className="absolute left-[10vw] top-[22vh] z-ambient hidden h-28 w-28 rounded-[42%_58%_54%_46%] bg-white/12 shadow-soft sm:block [html[data-theme=night]_&]:bg-white/[.035]" />
      <div className="absolute inset-x-[12vw] top-[14vh] z-ambient h-px bg-gradient-to-r from-transparent via-white/40 to-transparent [html[data-theme=night]_&]:via-white/10" />
    </div>
  );
}
