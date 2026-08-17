"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, CloudOff, Compass, Globe2, LoaderCircle, ShieldCheck } from "lucide-react";
import { DreamPearl } from "@/components/dream-pearl";
import { PageTransition } from "@/components/motion/page-transition";
import { isPublicArchiveAvailable } from "@/lib/archive-state";
import { formatDreamDate } from "@/lib/dreams";
import { reducedTransition, transitions } from "@/lib/motion/tokens";
import type { PublicDream } from "@/lib/public-archive";

function PublicArchiveStage({ dreams }: { dreams: PublicDream[] }) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const activeDream = dreams[activeIndex] ?? dreams[0];

  function move(delta: number) {
    setDirection(delta);
    setActiveIndex((current) => (current + delta + dreams.length) % dreams.length);
  }

  function select(index: number) {
    setDirection(index >= activeIndex ? 1 : -1);
    setActiveIndex(index);
  }

  return (
    <section
      className="relative mt-12 overflow-hidden rounded-[36px] border border-[color-mix(in_srgb,var(--calendar-line)_42%,transparent)] bg-[color-mix(in_srgb,var(--surface-canvas)_58%,transparent)] px-5 py-6 outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-memory-accessible/45 sm:mt-16 sm:rounded-[52px] sm:px-9 sm:py-9 lg:min-h-[620px] lg:px-14 lg:py-12"
      aria-label="Navegador de sueños públicos"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-[64%] top-1/2 aspect-square w-[76%] -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--calendar-line)_30%,transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[72%] top-1/2 aspect-square w-[49%] -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--calendar-line)_22%,transparent)]" />
      <div className="relative flex items-center justify-between gap-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Memoria {String(activeIndex + 1).padStart(2, "0")} / {String(dreams.length).padStart(2, "0")}</p>
        {dreams.length > 1 ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border-quiet)] text-text-secondary transition-colors hover:text-text-primary" aria-label="Sueño anterior"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border-quiet)] text-text-secondary transition-colors hover:text-text-primary" aria-label="Sueño siguiente"><ChevronRight className="h-4 w-4" /></button>
          </div>
        ) : null}
      </div>

      <div className="relative mt-10 min-h-[390px] sm:mt-14 lg:min-h-[420px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.article
            key={activeDream.id}
            custom={direction}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -18 }}
            transition={reducedMotion ? reducedTransition : transitions.expressive}
            className="grid gap-9 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-16"
          >
            <div className="flex items-start gap-5 lg:block">
              <DreamPearl dream={activeDream} size="lg" selected />
              <div className="lg:mt-10">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{formatDreamDate(activeDream.date)}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">{activeDream.authorName}</p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-balance text-[clamp(3.5rem,8vw,7.8rem)] leading-[.84] tracking-[-0.055em] text-text-primary">{activeDream.title}</h2>
              <div className="relative mt-8 max-w-3xl sm:mt-10">
                <p className="max-h-[17rem] overflow-y-auto whitespace-pre-wrap pr-3 text-base leading-8 text-text-secondary [mask-image:linear-gradient(to_bottom,black_82%,transparent)] sm:text-lg sm:leading-9">{activeDream.body}</p>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {dreams.length > 1 ? (
        <nav className="relative mt-7 border-t border-[var(--border-quiet)] pt-5" aria-label="Elegir sueño público">
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
            {dreams.map((dream, index) => {
              const selected = index === activeIndex;
              return (
                <button key={dream.id} type="button" onClick={() => select(index)} aria-current={selected ? "true" : undefined} aria-label={`Ver ${dream.title}, por ${dream.authorName}`} className="group flex min-h-11 min-w-11 flex-1 items-center gap-2 px-1 text-left">
                  <span className={`h-px flex-1 transition-[background-color,opacity,transform] duration-[var(--motion-standard)] ${selected ? "scale-y-[2] bg-memory-electric opacity-80" : "bg-[var(--calendar-line)] opacity-30 group-hover:opacity-60"}`} />
                  <span className={`hidden max-w-28 truncate text-[9px] uppercase tracking-[0.12em] sm:block ${selected ? "text-text-secondary" : "text-text-muted"}`}>{dream.title}</span>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </section>
  );
}

export function PublicDreamFeed() {
  const [dreams, setDreams] = React.useState<PublicDream[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  React.useEffect(() => {
    if (!isPublicArchiveAvailable) return;
    let active = true;
    void import("@/lib/public-archive")
      .then(({ loadPublicDreamsFromArchive }) => loadPublicDreamsFromArchive())
      .then((nextDreams) => {
        if (!active) return;
        setDreams(nextDreams);
        setStatus("ready");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);

  if (!isPublicArchiveAvailable) {
    return (
      <PageTransition className="pb-16">
        <section className="mx-auto max-w-3xl pt-5 sm:pt-10">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-text-muted"><Compass className="h-3.5 w-3.5" /> Archivo abierto</p>
          <h1 className="mt-5 font-display text-balance text-[clamp(3.25rem,10vw,8.5rem)] leading-[.84] tracking-[-0.06em]">Archivo en<br />preparación.</h1>
          <div className="surface-opal mt-12 max-w-xl rounded-[32px] p-8 sm:p-10">
            <ShieldCheck className="h-5 w-5 text-memory-accessible" aria-hidden="true" />
            <p className="mt-5 font-display text-4xl leading-none">Publicación desactivada.</p>
            <p className="mt-4 text-sm leading-7 text-text-secondary">Estamos completando la revisión de privacidad antes de habilitar publicaciones.</p>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="pb-16">
      <section className="mx-auto max-w-[1180px] pt-5 sm:pt-10">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-text-muted"><Compass className="h-3.5 w-3.5" /> Espacio público</p>
          <h1 className="mt-5 font-display text-balance text-[clamp(3.25rem,10vw,8.5rem)] leading-[.84] tracking-[-0.06em]">Sueños<br />compartidos.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary">Un archivo seudónimo para recorrer una memoria a la vez.</p>
          <p className="mt-4 flex max-w-2xl items-start gap-2 text-sm leading-6 text-text-muted"><Globe2 className="mt-1 h-4 w-4 shrink-0" /> Lo que aparece aquí es público. No compartas información que prefieras conservar en privado.</p>
        </div>

        {status === "loading" ? <div role="status" className="mt-14 flex items-center gap-3 text-sm text-text-muted"><LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Cargando archivo…</div> : null}
        {status === "error" ? <div role="alert" className="surface-frost mt-14 flex max-w-xl items-start gap-3 rounded-[24px] p-5 text-sm leading-6 text-text-secondary"><CloudOff className="mt-1 h-4 w-4 shrink-0 text-memory-accessible" /> No se pudo cargar el archivo. Inténtalo de nuevo.</div> : null}
        {status === "ready" && dreams.length === 0 ? <div className="surface-opal mt-14 max-w-xl rounded-[32px] p-8 sm:p-10"><p className="font-display text-4xl leading-none">No hay publicaciones todavía.</p><p className="mt-4 text-sm leading-6 text-text-secondary">Las publicaciones aparecerán aquí.</p></div> : null}
        {status === "ready" && dreams.length > 0 ? <PublicArchiveStage dreams={dreams} /> : null}
      </section>
    </PageTransition>
  );
}
