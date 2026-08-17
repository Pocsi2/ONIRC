"use client";

import { LockKeyhole } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { HoldPublicCalendar } from "@/components/hold-public-calendar";
import { PageTransition } from "@/components/motion/page-transition";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function HomeExperience() {
  const reducedMotion = useReducedMotion();

  return (
    <PageTransition className="grid min-h-[calc(100vh-8rem)] items-center pb-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
      <motion.section
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? reducedTransition : transitions.expressive}
        className="max-w-4xl"
      >
        <p className="text-xs font-medium uppercase tracking-[0.34em] text-text-muted opacity-50">Registro de sueños</p>
        <h1 className="type-ethereal mt-7 font-display text-balance text-[clamp(4rem,9.4vw,8.8rem)] leading-[.88] tracking-[-0.035em] text-text-primary">
          Tus sueños<br /><span className="type-ethereal-fringe">para siempre</span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-8 tracking-[0.03em] text-text-secondary sm:text-lg sm:leading-9">
          Guarda y Comparte tus sueños.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4">
          <HoldPublicCalendar />
          <p className="flex max-w-md items-start gap-2 text-sm leading-6 text-text-muted">
            <LockKeyhole className="mt-1 h-4 w-4 shrink-0" /> Guardado en este dispositivo. La copia privada es opcional.
          </p>
        </div>
      </motion.section>

      <motion.figure
        aria-hidden="true"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? reducedTransition : { ...transitions.dream, delay: 0.08 }}
        className="relative mx-auto mt-14 hidden min-h-[440px] w-full max-w-xl lg:block"
      >
        <div className="absolute inset-x-[9%] top-[13%] aspect-square rounded-full border border-[var(--calendar-line)]" />
        <div className="absolute inset-x-[23%] top-[27%] aspect-square rounded-full border border-[var(--border-quiet)]" />
        <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_31%_23%,rgba(255,255,255,.98),rgba(220,239,233,.8)_37%,rgba(230,224,237,.57)_70%,rgba(255,255,255,.25))] shadow-[0_24px_80px_rgba(96,90,84,.18)]">
          <span className="h-8 w-10 rounded-full bg-white/72 blur-[2px]" />
        </div>
        <motion.span className="absolute left-[7%] top-[33%] h-px w-[28%] origin-left bg-memory-electric/70" animate={reducedMotion ? undefined : { rotate: [8, 18, 7], scaleX: [0.72, 1, 0.78] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <span className="absolute bottom-[18%] right-[13%] h-px w-[19%] -rotate-12 bg-mist-lavender/80" />
      </motion.figure>
    </PageTransition>
  );
}
