"use client";

import * as React from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DreamPearl } from "@/components/dream-pearl";
import { Button } from "@/components/ui/button";
import type { Dream } from "@/lib/dreams";
import { formatDreamDate } from "@/lib/dreams";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function DreamFocus({ dream, onBack, onEdit, onDelete }: { dream: Dream; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const reducedMotion = useReducedMotion();
  const backRef = React.useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    window.setTimeout(() => backRef.current?.focus(), 30);
  }, []);

  return (
    <motion.section
      aria-label={`Memoria: ${dream.title}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={reducedMotion ? reducedTransition : transitions.dream}
      className="fixed inset-0 z-focus overflow-y-auto bg-[color-mix(in_srgb,var(--surface-canvas)_84%,transparent)] px-4 pb-8 pt-24 backdrop-blur-md sm:px-6 sm:pt-28 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <button ref={backRef} type="button" onClick={onBack} className="material-button inline-flex min-h-11 items-center gap-2 rounded-[16px] px-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al tiempo
        </button>
        <motion.article layoutId={`memory-surface-${dream.id}`} className="surface-opal relative mt-6 overflow-hidden rounded-[36px] px-6 py-10 sm:mt-8 sm:rounded-[48px] sm:px-12 sm:py-14 lg:px-16 lg:py-20">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/28 blur-3xl [html[data-theme=night]_&]:bg-mist-blush/10" />
          <div className="absolute -bottom-24 left-[15%] h-64 w-64 rounded-full bg-mist-cyan/22 blur-3xl [html[data-theme=night]_&]:bg-mist-cyan/10" />
          <div className="relative">
            <div className="flex items-start justify-between gap-8">
              <DreamPearl dream={dream} size="xl" selected layoutId={`pearl-${dream.id}`} />
              <p className="max-w-[13rem] pt-2 text-right text-xs uppercase leading-6 tracking-[0.22em] text-text-muted">Un recuerdo guardado en este dispositivo</p>
            </div>
            <p className="mt-12 text-sm text-text-muted sm:mt-16">{formatDreamDate(dream.date)}</p>
            <h1 className="mt-5 max-w-4xl font-display text-balance text-[clamp(4rem,10vw,9rem)] leading-[.84] tracking-[-0.065em]">{dream.title}</h1>
            <p className="memory-copy mt-10 whitespace-pre-wrap">{dream.body}</p>
            <div className="mt-14 flex flex-col gap-4 border-t border-white/45 pt-7 sm:flex-row sm:items-center sm:justify-between [html[data-theme=night]_&]:border-white/10">
              <p className="max-w-md text-sm leading-6 text-text-muted">El calendario sigue detrás de esta memoria.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onEdit}><Pencil className="h-4 w-4" />Editar</Button>
                <Button variant="ghost" onClick={() => setConfirming(true)}><Trash2 className="h-4 w-4" />Eliminar</Button>
              </div>
            </div>
            {confirming ? (
              <div className="mt-6 rounded-[22px] border border-[rgba(185,14,49,.2)] bg-[rgba(185,14,49,.08)] p-4 text-sm leading-6 text-text-secondary [html[data-theme=night]_&]:border-[rgba(255,138,152,.26)] [html[data-theme=night]_&]:bg-[rgba(255,138,152,.1)]" role="alert">
                <p>¿Eliminar “{dream.title}”? Podrás deshacer esta acción durante unos segundos.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={onDelete}>Eliminar sueño</Button>
                  <button type="button" className="min-h-10 px-3 text-sm" onClick={() => setConfirming(false)}>Conservarlo</button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
