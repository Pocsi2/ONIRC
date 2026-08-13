"use client";

import { motion, useReducedMotion } from "motion/react";
import { pageEnter } from "@/lib/motion/variants";

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
      initial="hidden"
      animate="visible"
      variants={
        reducedMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.1 } },
            }
          : pageEnter
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
