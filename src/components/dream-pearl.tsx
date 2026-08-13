"use client";

import type * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Dream } from "@/lib/dreams";
import { motionSprings, reducedTransition, transitions } from "@/lib/motion/tokens";
import { pearlMotion, withReducedMotion } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const hueClass: Record<Dream["hue"], string> = {
  cyan: "from-mist-cyan/80 via-white/90 to-mist-lavender/55",
  lavender: "from-mist-lavender/80 via-white/90 to-mist-blush/55",
  blush: "from-mist-blush/80 via-white/90 to-mist-champagne/55",
  mint: "from-mist-mint/80 via-white/90 to-mist-cyan/50",
  champagne: "from-mist-champagne/85 via-white/90 to-mist-mint/50",
};

export function DreamPearl({
  dream,
  size = "md",
  selected = false,
  focused = false,
  multiple = false,
  interactive = false,
  transitionName,
  className,
}: {
  dream: Dream;
  size?: "sm" | "md" | "lg" | "xl";
  selected?: boolean;
  focused?: boolean;
  multiple?: boolean;
  interactive?: boolean;
  transitionName?: string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const dimensions = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-8 w-8",
    xl: "h-24 w-24 sm:h-32 sm:w-32",
  }[size];

  const variants = withReducedMotion(pearlMotion, reducedMotion);
  const sharedElementStyle = transitionName
    ? ({ viewTransitionName: transitionName } as React.CSSProperties)
    : undefined;

  return (
    <motion.span
      style={sharedElementStyle}
      initial={false}
      animate={selected ? "selected" : focused ? "focus" : "rest"}
      whileHover={interactive && !reducedMotion ? "hover" : undefined}
      whileTap={interactive && !reducedMotion ? "tap" : undefined}
      variants={variants}
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full will-change-transform",
        dimensions,
        (selected || focused) && "z-focus",
        className,
      )}
      transition={
        interactive && !reducedMotion
          ? motionSprings.pearl
          : reducedMotion
            ? reducedTransition
            : transitions.dream
      }
    >
      <span
        className={cn(
          "motion-dream absolute inset-[-140%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.72),rgba(221,242,239,.32)_34%,transparent_66%)] opacity-60 blur-md transition group-hover:opacity-85 group-focus-visible:opacity-95",
          multiple && "inset-[-170%] opacity-75",
          selected && "opacity-100 blur-xl",
        )}
      />
      <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_4px_18px_rgba(150,145,139,.16)] transition-shadow duration-[var(--motion-fast)] ease-[var(--ease-material)] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,.98),0_8px_30px_rgba(150,145,139,.2)] group-focus-visible:shadow-[inset_0_1px_1px_rgba(255,255,255,.98),0_0_0_6px_rgba(221,242,239,.42),0_8px_30px_rgba(150,145,139,.2)]", hueClass[dream.hue])} />
      <span className="absolute left-[24%] top-[18%] h-[24%] w-[32%] rounded-full bg-white/90 blur-[1px]" />
      {multiple ? (
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_12px_rgba(232,225,241,.7)]" />
      ) : null}
    </motion.span>
  );
}
