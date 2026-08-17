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
      whileHover={reducedMotion ? undefined : { scale: 1.06, rotate: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      transition={reducedMotion ? reducedTransition : transitions.standard}
      className="group relative grid h-[4.6rem] w-[4.6rem] place-items-center overflow-visible rounded-full border border-white/65 bg-white/28 text-text-primary shadow-soft backdrop-blur-md [html[data-theme=night]_&]:border-white/15 [html[data-theme=night]_&]:bg-white/[.05]"
      aria-label="Registrar sueño"
    >
      <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,.98),rgba(221,242,239,.68)_38%,rgba(232,225,241,.42)_70%,transparent)] blur-[3px] transition-[filter,transform] duration-[var(--motion-dream)] ease-[var(--ease-dream)] group-hover:scale-110 group-hover:blur-0 group-focus-visible:scale-110 group-focus-visible:blur-0" />
      <span className="absolute inset-[-7px] rounded-full border border-memory-electric/0 transition-all duration-[var(--motion-expressive)] group-hover:inset-[-12px] group-hover:border-memory-electric/50 group-focus-visible:inset-[-12px] group-focus-visible:border-memory-electric/50" />
      <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,.86)] [html[data-theme=night]_&]:bg-white/10">
        <Feather className="h-4 w-4" />
      </span>
      <span className="pointer-events-none absolute right-[calc(100%+0.8rem)] whitespace-nowrap rounded-full bg-[var(--surface-canvas)] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Registrar sueño</span>
      {emphasized ? <span className="absolute -right-1 top-1/2 h-px w-5 bg-memory-electric" aria-hidden="true" /> : null}
    </motion.button>
  );
}
