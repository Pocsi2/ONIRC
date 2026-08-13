"use client";

import { Feather } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function CloudCurtain({ onOpen, emphasized = false }: { onOpen: () => void; emphasized?: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={reducedMotion ? reducedTransition : transitions.standard}
      className="group relative flex min-h-12 items-center overflow-hidden rounded-full border border-white/65 bg-white/56 py-1 pl-2 pr-4 text-sm font-medium text-text-primary shadow-soft backdrop-blur-md [html[data-theme=night]_&]:border-white/15 [html[data-theme=night]_&]:bg-white/[.07]"
      aria-label="Registrar sueño"
    >
      <span className="absolute -left-2 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.95),rgba(221,242,239,.68)_44%,rgba(232,225,241,.42)_72%,transparent)] blur-[1px] transition-transform duration-[var(--motion-expressive)] ease-[var(--ease-dream)] group-hover:translate-x-7 group-focus-visible:translate-x-7" />
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,.86)] [html[data-theme=night]_&]:bg-white/10">
        <Feather className="h-4 w-4" />
      </span>
      <span className="relative ml-2 whitespace-nowrap">Registrar sueño</span>
      {emphasized ? <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-memory-electric" aria-hidden="true" /> : null}
    </motion.button>
  );
}
