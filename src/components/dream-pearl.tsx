"use client";

import type * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Dream } from "@/lib/dreams";
import { motionSprings, reducedTransition, transitions } from "@/lib/motion/tokens";
import { pearlMotion, withReducedMotion } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const hueClass: Record<Dream["hue"], string> = {
  cyan: "from-mist-cyan/85 via-white/95 to-mist-lavender/55",
  lavender: "from-mist-lavender/84 via-white/95 to-mist-blush/52",
  blush: "from-mist-blush/84 via-white/95 to-mist-champagne/54",
  mint: "from-mist-mint/84 via-white/95 to-mist-cyan/52",
  champagne: "from-mist-champagne/88 via-white/95 to-mist-mint/52",
};

export function DreamPearl({
  dream,
  size = "md",
  selected = false,
  focused = false,
  multiple = false,
  interactive = false,
  layoutId,
  transitionName,
  className,
}: {
  dream: Pick<Dream, "hue">;
  size?: "sm" | "md" | "lg" | "xl";
  selected?: boolean;
  focused?: boolean;
  multiple?: boolean;
  interactive?: boolean;
  layoutId?: string;
  transitionName?: string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const dimensions = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-9 w-9",
    xl: "h-20 w-20 sm:h-28 sm:w-28",
  }[size];
  const variants = withReducedMotion(pearlMotion, reducedMotion);
  const sharedElementStyle = transitionName ? ({ viewTransitionName: transitionName } as React.CSSProperties) : undefined;

  return (
    <motion.span
      layoutId={layoutId}
      style={sharedElementStyle}
      initial={false}
      animate={selected ? "selected" : focused ? "focus" : "rest"}
      whileHover={interactive && !reducedMotion ? "hover" : undefined}
      whileTap={interactive && !reducedMotion ? "tap" : undefined}
      variants={variants}
      transition={interactive && !reducedMotion ? motionSprings.pearl : reducedMotion ? reducedTransition : transitions.dream}
      className={cn("relative inline-grid shrink-0 place-items-center rounded-full will-change-transform", dimensions, (selected || focused) && "z-focus", className)}
    >
      <span className={cn("absolute inset-[-65%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.6),rgba(221,242,239,.17)_38%,transparent_70%)] opacity-30 blur-md", multiple && "inset-[-82%] opacity-42", (selected || focused) && "opacity-75 blur-lg")} />
      <span className={cn("absolute inset-0 rounded-full bg-gradient-to-br shadow-[inset_0_1px_1px_rgba(255,255,255,.96),0_3px_13px_rgba(105,98,92,.14)]", hueClass[dream.hue])} />
      <span className="absolute left-[24%] top-[18%] h-[23%] w-[31%] rounded-full bg-white/88 blur-[1px]" />
      {multiple ? <span className="absolute -inset-1.5 rounded-full border border-white/65 [html[data-theme=night]_&]:border-white/20" aria-hidden="true" /> : null}
    </motion.span>
  );
}
