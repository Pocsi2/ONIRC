import type { Variants } from "motion/react";
import { motionDurations, transitions } from "@/lib/motion/tokens";

export function withReducedMotion(variants: Variants, reduced: boolean | null): Variants {
  if (!reduced) return variants;

  const result: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = {
        opacity: "opacity" in value ? value.opacity : 1,
        transition: { duration: motionDurations.instant },
      };
    }
  }
  return result;
}

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.992 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.expressive,
  },
};

export const softReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.standard,
  },
};

export const dreamReveal: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.dream,
  },
};

export const pearlMotion = {
  rest: { scale: 1 },
  hover: { scale: 1.055 },
  focus: { scale: 1.08 },
  selected: { scale: 1.11 },
  tap: { scale: 0.985 },
} satisfies Variants;

export const calendarRecede: Variants = {
  rest: { opacity: 1 },
  receded: {
    opacity: 0.4,
    scale: 0.995,
    transition: transitions.standard,
  },
};

export function staggeredDreamReveal(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...transitions.expressive,
        delay,
      },
    },
  };
}
