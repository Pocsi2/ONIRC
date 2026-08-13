import type { Transition } from "motion/react";

export const motionDurations = {
  instant: 0.1,
  fast: 0.18,
  standard: 0.34,
  expressive: 0.56,
  dream: 0.82,
  ambientSlow: 24,
  ambientSlower: 34,
} as const;

export const motionEase = {
  softOut: [0.16, 1, 0.3, 1],
  softIn: [0.7, 0, 0.84, 0],
  dream: [0.2, 0.8, 0.2, 1],
  material: [0.22, 1, 0.36, 1],
} as const;

export const motionSprings = {
  pearl: {
    type: "spring",
    stiffness: 220,
    damping: 28,
    mass: 0.8,
  },
  material: {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 0.9,
  },
} satisfies Record<string, Transition>;

export const transitions = {
  instant: {
    duration: motionDurations.instant,
    ease: motionEase.softOut,
  },
  fast: {
    duration: motionDurations.fast,
    ease: motionEase.material,
  },
  standard: {
    duration: motionDurations.standard,
    ease: motionEase.softOut,
  },
  expressive: {
    duration: motionDurations.expressive,
    ease: motionEase.softOut,
  },
  dream: {
    duration: motionDurations.dream,
    ease: motionEase.dream,
  },
} satisfies Record<string, Transition>;

export const reducedTransition = {
  ...transitions.instant,
  ease: motionEase.softOut,
} satisfies Transition;
