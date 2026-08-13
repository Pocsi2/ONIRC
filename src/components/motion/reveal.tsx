"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { softReveal } from "@/lib/motion/variants";
import { reducedTransition } from "@/lib/motion/tokens";

export function Reveal({
  children,
  className,
  delay = 0,
  variants = softReveal,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={
        reducedMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { ...reducedTransition, delay } },
            }
          : variants
      }
      transition={reducedMotion ? undefined : { delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
