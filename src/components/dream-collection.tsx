"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DreamPearl } from "@/components/dream-pearl";
import type { Dream } from "@/lib/dreams";
import { formatDreamDate, summaryForDream } from "@/lib/dreams";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function DreamCollection({ date, dreams, onBack, onSelect }: { date: string; dreams: Dream[]; onBack: () => void; onSelect: (dream: Dream) => void }) {
  const reducedMotion = useReducedMotion();
  const backRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    window.setTimeout(() => backRef.current?.focus(), 30);
  }, []);

  return (
    <motion.section aria-label={`Sueños del ${formatDreamDate(date)}`} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} transition={reducedMotion ? reducedTransition : transitions.expressive} className="fixed inset-0 z-focus overflow-y-auto bg-[color-mix(in_srgb,var(--surface-canvas)_94%,transparent)] px-4 pb-8 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-3xl">
        <button ref={backRef} type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] px-2 text-sm text-text-secondary transition-colors hover:text-text-primary"><ArrowLeft className="h-4 w-4" />Volver al calendario</button>
        <div className="mt-7">
          <p className="text-sm text-text-muted">{formatDreamDate(date)}</p>
          <h2 className="mt-3 font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.86] tracking-[-0.055em]">{dreams.length} sueños<br />ese día.</h2>
          <div className="mt-10 border-y border-[var(--border-quiet)]">
            {dreams.map((dream) => (
              <button key={dream.id} type="button" className="group flex w-full items-center gap-5 border-b border-[var(--border-quiet)] py-6 text-left last:border-b-0" onClick={() => onSelect(dream)} aria-label={`Abrir sueño: ${dream.title}`}>
                <DreamPearl dream={dream} size="lg" interactive layoutId={`pearl-${dream.id}`} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-3xl leading-none tracking-[-0.035em]">{dream.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-text-secondary">{summaryForDream(dream.body)}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-[var(--motion-fast)] group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
