"use client";

import * as React from "react";
import { CloudOff, Compass, Globe2, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DreamPearl } from "@/components/dream-pearl";
import { PageTransition } from "@/components/motion/page-transition";
import { formatDreamDate } from "@/lib/dreams";
import { subscribeToPublicDreams, type PublicDream } from "@/lib/cloud-dreams";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function PublicDreamFeed() {
  const [dreams, setDreams] = React.useState<PublicDream[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const reducedMotion = useReducedMotion();

  React.useEffect(() => subscribeToPublicDreams(
    (nextDreams) => {
      setDreams(nextDreams);
      setStatus("ready");
    },
    () => setStatus("error"),
  ), []);

  return (
    <PageTransition className="pb-16">
      <section className="mx-auto max-w-[1080px] pt-5 sm:pt-10">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-text-muted"><Compass className="h-3.5 w-3.5" /> Espacio público</p>
          <h1 className="mt-5 font-display text-balance text-[clamp(4.2rem,10vw,8.5rem)] leading-[.84] tracking-[-0.06em]">Sueños que<br />alguien quiso dejar.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary">Fragmentos compartidos con seudónimo, sin métricas y sin prisa. Cada persona decide qué memoria vuelve visible.</p>
          <p className="mt-4 flex max-w-2xl items-start gap-2 text-sm leading-6 text-text-muted"><Globe2 className="mt-1 h-4 w-4 shrink-0" /> Lo que aparece aquí es público. No compartas información que prefieras conservar en privado.</p>
        </div>

        {status === "loading" ? <div role="status" className="mt-14 flex items-center gap-3 text-sm text-text-muted"><LoaderCircle className="h-4 w-4 animate-spin" /> Escuchando el espacio…</div> : null}
        {status === "error" ? <div role="alert" className="surface-frost mt-14 flex max-w-xl items-start gap-3 rounded-[24px] p-5 text-sm leading-6 text-text-secondary"><CloudOff className="mt-1 h-4 w-4 shrink-0 text-memory-accessible" /> No pudimos abrir las memorias públicas ahora. Inténtalo de nuevo en un momento.</div> : null}
        {status === "ready" && dreams.length === 0 ? <div className="surface-opal mt-14 max-w-xl rounded-[32px] p-8 sm:p-10"><p className="font-display text-4xl leading-none">Todavía hay silencio.</p><p className="mt-4 text-sm leading-6 text-text-secondary">Cuando alguien haga público un sueño, aparecerá aquí como una nueva perla.</p></div> : null}

        {status === "ready" && dreams.length > 0 ? <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {dreams.map((dream, index) => (
            <motion.article key={dream.id} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? reducedTransition : { ...transitions.standard, delay: Math.min(index * 0.035, 0.25) }} className="surface-frost relative overflow-hidden rounded-[30px] p-6 sm:p-7">
              <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full bg-white/30 blur-3xl [html[data-theme=night]_&]:bg-white/[.04]" />
              <div className="relative">
                <DreamPearl dream={dream} size="sm" />
                <p className="mt-7 text-xs uppercase tracking-[0.18em] text-text-muted">{formatDreamDate(dream.date)}</p>
                <h2 className="mt-3 font-display text-4xl leading-[.9] tracking-[-0.045em] text-text-primary">{dream.title}</h2>
                <p className="mt-5 max-h-[10.5rem] overflow-hidden whitespace-pre-wrap text-sm leading-7 text-text-secondary">{dream.body}</p>
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">por {dream.authorName}</p>
              </div>
            </motion.article>
          ))}
        </div> : null}
      </section>
    </PageTransition>
  );
}
