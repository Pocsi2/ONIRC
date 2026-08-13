"use client";

import { ArrowRight, Cloud, LockKeyhole } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AuthControl } from "@/components/auth-control";
import { PageTransition } from "@/components/motion/page-transition";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function HomeExperience() {
  const reducedMotion = useReducedMotion();

  return (
    <PageTransition className="grid min-h-[calc(100vh-9rem)] items-center gap-12 pb-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? reducedTransition : transitions.expressive} className="max-w-3xl">
        <p className="mb-7 text-xs font-medium uppercase tracking-[0.32em] text-text-muted">Diario de sueños local</p>
        <h1 className="font-display text-balance text-[clamp(4.2rem,10vw,9rem)] leading-[.86] tracking-[-0.06em] text-text-primary">
          Tus sueños,<br />visibles en el tiempo.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
          Onirc convierte cada recuerdo en una perla: un punto íntimo al que puedes volver cuando quieras.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ViewTransitionLink href="/calendar" className="surface-pearl inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] px-5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-float">
            Abrir mi calendario <ArrowRight className="h-4 w-4" />
          </ViewTransitionLink>
          <p className="flex items-center gap-2 text-sm leading-6 text-text-muted">
            <LockKeyhole className="h-4 w-4 shrink-0" /> Se guarda sólo en este navegador.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AuthControl />
          <p className="flex items-center gap-2 text-sm leading-6 text-text-muted"><Cloud className="h-4 w-4 shrink-0" /> Conecta una cuenta para preparar tu sincronización privada.</p>
        </div>
      </motion.div>

      <motion.div initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reducedMotion ? reducedTransition : { ...transitions.dream, delay: 0.08 }} className="relative mx-auto w-full max-w-xl">
        <div className="surface-opal relative min-h-[360px] overflow-hidden rounded-[44px] p-7 sm:min-h-[440px] sm:p-10">
          <div className="absolute left-[12%] top-[18%] h-[58%] w-[76%] rounded-[50%] border border-white/45 [html[data-theme=night]_&]:border-white/10" />
          <div className="absolute left-[24%] top-[33%] h-[30%] w-[52%] rounded-[50%] border border-white/40 [html[data-theme=night]_&]:border-white/[.08]" />
          <span className="absolute left-[25%] top-[28%] h-4 w-4 rounded-full bg-[radial-gradient(circle_at_30%_20%,white,rgba(221,242,239,.8)_38%,rgba(232,225,241,.68))] shadow-[0_7px_28px_rgba(116,112,108,.22)]" />
          <span className="absolute right-[23%] top-[49%] h-8 w-8 rounded-full bg-[radial-gradient(circle_at_30%_20%,white,rgba(242,224,229,.8)_38%,rgba(241,230,210,.68))] shadow-[0_9px_32px_rgba(116,112,108,.2)]" />
          <span className="absolute bottom-[20%] left-[43%] h-5 w-5 rounded-full bg-[radial-gradient(circle_at_30%_20%,white,rgba(232,225,241,.8)_38%,rgba(221,242,239,.6))] shadow-[0_7px_28px_rgba(116,112,108,.18)]" />
          <div className="absolute inset-x-7 bottom-7 border-t border-white/45 pt-5 [html[data-theme=night]_&]:border-white/10">
            <p className="font-display text-4xl leading-none tracking-[-0.04em]">Un lugar para volver.</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">Sin feed, sin métricas, sin ruido. Sólo el tiempo y lo que decidiste conservar.</p>
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
