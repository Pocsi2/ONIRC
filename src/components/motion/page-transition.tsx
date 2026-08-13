"use client";

import { motion, useReducedMotion } from "motion/react";
import { pageEnter } from "@/lib/motion/variants";
import { reducedTransition } from "@/lib/motion/tokens";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      animate="visible"
      variants={
        reducedMotion
          ? {
            hidden: { opacity: 0 },
              visible: { opacity: 1, transition: reducedTransition },
            }
          : pageEnter
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
