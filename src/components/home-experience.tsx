"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PageTransition } from "@/components/motion/page-transition";
import { ViewTransitionLink } from "@/components/view-transition-link";
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
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-text-muted">Registro de sueños</p>
        <h1 className="mt-7 font-display text-balance text-[clamp(4.4rem,10.5vw,9.6rem)] leading-[.83] tracking-[-0.065em] text-text-primary">
          Guarda lo<br />que soñaste.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl sm:leading-9">
          Escribe, guarda y consulta tus sueños.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4">
          <ViewTransitionLink href="/calendar" className="surface-pearl inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] px-5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-float">
            Abrir calendario <ArrowRight className="h-4 w-4" />
          </ViewTransitionLink>
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
        <span className="absolute left-[13%] top-[33%] h-2 w-2 rounded-full bg-mist-champagne/80" />
        <span className="absolute bottom-[18%] right-[17%] h-3 w-3 rounded-full bg-mist-lavender/80" />
      </motion.figure>
    </PageTransition>
  );
}
