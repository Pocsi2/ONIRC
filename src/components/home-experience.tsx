"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Eye, LockKeyhole, PenLine } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ElectricTrail } from "@/components/landing/electric-trail";
import { PageTransition } from "@/components/motion/page-transition";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

const chapters = {
  private: "landing-private",
  threshold: "landing-threshold",
  pseudonym: "landing-pseudonym",
  archive: "landing-archive",
  entry: "landing-entry",
} as const;

type ChapterHeadingProps = {
  number: string;
  eyebrow: string;
  id: string;
  children: ReactNode;
  className?: string;
};

function ChapterHeading({ number, eyebrow, id, children, className = "" }: ChapterHeadingProps) {
  return (
    <div className={className}>
      <div className="mb-7 flex items-center gap-4 text-[0.62rem] uppercase tracking-[0.34em] text-text-muted sm:mb-10">
        <span aria-hidden="true">{number}</span>
        <span className="h-px w-9 bg-[var(--calendar-line)]" aria-hidden="true" />
        <span>{eyebrow}</span>
      </div>
      <h2 id={id} className="font-display text-balance text-[clamp(3.5rem,9vw,9.25rem)] font-light leading-[0.87] tracking-[-0.055em] text-text-primary">
        {children}
      </h2>
    </div>
  );
}

export function HomeExperience() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, reducedMotion ? 0 : -56]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, reducedMotion ? 1 : 0.22]);
  const archiveRotation = useTransform(scrollYProgress, [0.54, 0.86], [0, reducedMotion ? 0 : 48]);

  const revealProps = reducedMotion
    ? {
        initial: { opacity: 1 },
        whileInView: { opacity: 1 },
        transition: reducedTransition,
      }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        transition: transitions.expressive,
      };

  return (
    <PageTransition className="relative -mt-5 sm:-mt-8">
      <ElectricTrail className="z-0" />
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-navigation h-px origin-left bg-memory-electric/70"
        style={{ scaleX: reducedMotion ? 1 : scrollYProgress }}
      />

      <article aria-label="Onirc, archivo de sueños" className="relative z-[1]">
        <section aria-labelledby="landing-origin" className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center py-20 sm:py-24">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-[1] max-w-[78rem]">
            <p className="mb-8 text-[0.62rem] font-medium uppercase tracking-[0.38em] text-text-muted opacity-60 sm:mb-12">
              Archivo personal de sueños
            </p>
            <h1 id="landing-origin" className="font-display text-balance text-[clamp(4.15rem,12.5vw,12rem)] font-light leading-[0.79] tracking-[-0.065em] text-text-primary">
              Tus sueños
              <span className="block pl-[8vw] text-text-primary/72">para siempre.</span>
            </h1>
            <div className="mt-10 flex flex-col gap-8 sm:mt-14 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-base font-light leading-7 tracking-[0.015em] text-text-secondary sm:text-lg sm:leading-8">
                Escribe y comparte los tuyos.
              </p>
              <a
                href={`#${chapters.private}`}
                className="group inline-flex min-h-11 w-fit items-center gap-3 text-[0.68rem] uppercase tracking-[0.3em] text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary focus-visible:rounded-full focus-visible:outline-none"
              >
                Recorrer
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border-light)] transition-transform duration-[var(--motion-standard)] group-hover:translate-y-1" aria-hidden="true">
                  <ArrowDown className="h-4 w-4 stroke-[1.2]" />
                </span>
              </a>
            </div>
          </motion.div>

          <div aria-hidden="true" className="pointer-events-none absolute right-[3%] top-[18%] h-[clamp(10rem,26vw,25rem)] w-[clamp(10rem,26vw,25rem)] rounded-full border border-[var(--calendar-line)] opacity-60" />
          <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[27%] h-px w-[22vw] max-w-80 bg-memory-electric/55" />
        </section>

        <section id={chapters.private} aria-labelledby="landing-private-title" className="relative grid min-h-[82svh] scroll-mt-24 items-center gap-12 border-t border-[var(--border-quiet)] py-24 lg:grid-cols-[0.85fr_1.15fr] lg:py-32">
          <motion.div {...revealProps} viewport={{ once: true, amount: 0.34 }}>
            <ChapterHeading number="02" eyebrow="Privado" id="landing-private-title">
              Primero,
              <span className="block text-text-primary/64">tuyos.</span>
            </ChapterHeading>
            <p className="mt-10 max-w-md text-base font-light leading-8 text-text-secondary sm:text-lg">
              Cada sueño empieza en un espacio privado. Tú decides si permanece ahí.
            </p>
          </motion.div>

          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={reducedMotion ? reducedTransition : transitions.dream}
            className="relative mx-auto aspect-square w-[min(78vw,31rem)] rounded-full border border-[var(--calendar-line)]"
          >
            <div className="absolute inset-[16%] rounded-full border border-[var(--border-quiet)]" />
            <LockKeyhole className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 stroke-[0.85] text-text-secondary" />
            <span className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom -translate-x-1/2 bg-memory-electric/60" />
          </motion.div>
        </section>

        <section id={chapters.threshold} aria-labelledby="landing-threshold-title" className="relative flex min-h-[88svh] scroll-mt-24 items-center overflow-hidden border-t border-[var(--border-quiet)] py-24 lg:py-32">
          <motion.div {...revealProps} viewport={{ once: true, amount: 0.36 }} className="relative z-[1] ml-auto max-w-5xl text-right">
            <ChapterHeading number="03" eyebrow="Umbral público" id="landing-threshold-title" className="flex flex-col items-end">
              Publicar
              <span className="block text-memory-accessible">es cruzar.</span>
            </ChapterHeading>
            <p className="ml-auto mt-10 max-w-md text-base font-light leading-8 text-text-secondary sm:text-lg">
              Nada se comparte por accidente. Relees, eliges una firma y confirmas.
            </p>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="absolute inset-y-[8%] left-[18%] w-px origin-top bg-memory-electric/75"
            initial={reducedMotion ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.32 }}
            transition={reducedMotion ? reducedTransition : transitions.dream}
          />
          <span aria-hidden="true" className="absolute left-[18%] top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-[clamp(4rem,13vw,12rem)] font-light uppercase tracking-[0.32em] text-text-primary/[0.035]">
            deliberado
          </span>
        </section>

        <section id={chapters.pseudonym} aria-labelledby="landing-pseudonym-title" className="relative grid min-h-[80svh] scroll-mt-24 items-center gap-16 border-t border-[var(--border-quiet)] py-24 lg:grid-cols-[1.2fr_.8fr] lg:py-32">
          <motion.div {...revealProps} viewport={{ once: true, amount: 0.36 }}>
            <ChapterHeading number="04" eyebrow="Seudónimo" id="landing-pseudonym-title">
              Tu firma.
              <span className="block text-text-primary/58">No tu identidad.</span>
            </ChapterHeading>
            <p className="mt-10 max-w-lg text-base font-light leading-8 text-text-secondary sm:text-lg">
              Una presencia reconocible en el archivo público, separada de tus datos personales.
            </p>
          </motion.div>

          <motion.figure
            aria-label="Ejemplo de firma seudónima"
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={reducedMotion ? reducedTransition : transitions.expressive}
            className="ml-auto w-full max-w-sm border-y border-[var(--border-quiet)] py-8"
          >
            <div className="flex items-center justify-between gap-8">
              <figcaption className="font-display text-2xl font-light tracking-[0.08em] text-text-primary">Luz de agosto</figcaption>
              <span className="h-px flex-1 bg-memory-electric/55" aria-hidden="true" />
              <span className="text-[0.62rem] uppercase tracking-[0.3em] text-text-muted">firma</span>
            </div>
          </motion.figure>
        </section>

        <section id={chapters.archive} aria-labelledby="landing-archive-title" className="relative flex min-h-[92svh] scroll-mt-24 items-center border-t border-[var(--border-quiet)] py-24 lg:py-32">
          <motion.div {...revealProps} viewport={{ once: true, amount: 0.35 }} className="relative z-[1] max-w-5xl">
            <ChapterHeading number="05" eyebrow="Archivo" id="landing-archive-title">
              Un archivo
              <span className="block text-text-primary/58">abierto.</span>
            </ChapterHeading>
            <p className="mt-10 max-w-lg text-base font-light leading-8 text-text-secondary sm:text-lg">
              Recorre sueños públicos por fecha. Sin perfiles, contadores ni competencia por atención.
            </p>
          </motion.div>

          <motion.div aria-hidden="true" style={{ rotate: archiveRotation }} className="pointer-events-none absolute -right-[18vw] top-1/2 aspect-square w-[min(92vw,58rem)] -translate-y-1/2 rounded-full border border-[var(--calendar-line)]">
            <div className="absolute inset-[15%] rounded-full border border-[var(--border-quiet)]" />
            <div className="absolute inset-[32%] rounded-full border border-[var(--border-quiet)]" />
            <span className="absolute left-[14%] top-[21%] h-2.5 w-2.5 rounded-full bg-memory-electric shadow-[0_0_24px_rgba(230,59,87,.34)]" />
            <span className="absolute bottom-[10%] left-[47%] h-1.5 w-1.5 rounded-full bg-text-secondary/45" />
            <span className="absolute right-[4%] top-[49%] h-2 w-2 rounded-full border border-memory-electric/50" />
          </motion.div>
        </section>

        <section id={chapters.entry} aria-labelledby="landing-entry-title" className="relative min-h-[84svh] scroll-mt-24 border-t border-[var(--border-quiet)] py-24 lg:py-32">
          <motion.div {...revealProps} viewport={{ once: true, amount: 0.3 }}>
            <ChapterHeading number="06" eyebrow="Entrada" id="landing-entry-title">
              Elige dónde
              <span className="block pl-[7vw] text-text-primary/62">entrar.</span>
            </ChapterHeading>
          </motion.div>

          <div className="mt-20 grid border-y border-[var(--border-quiet)] md:grid-cols-2 md:divide-x md:divide-[var(--border-quiet)]">
            <ViewTransitionLink
              href="/calendar"
              data-memory-target
              className="group flex min-h-48 items-end justify-between gap-8 border-b border-[var(--border-quiet)] px-1 py-8 transition-colors duration-[var(--motion-standard)] hover:bg-[color-mix(in_srgb,var(--surface-frost)_38%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--surface-frost)_48%,transparent)] md:border-b-0 md:px-8"
              aria-label="Entrar a mi calendario privado"
            >
              <span>
                <LockKeyhole className="mb-7 h-5 w-5 stroke-[0.9] text-text-muted" aria-hidden="true" />
                <span className="block font-display text-[clamp(2rem,4vw,4.5rem)] font-light leading-none tracking-[-0.045em] text-text-primary">Mi calendario</span>
                <span className="mt-3 block text-sm font-light text-text-secondary">Escribir y consultar</span>
              </span>
              <ArrowUpRight className="mb-1 h-6 w-6 shrink-0 stroke-[0.9] transition-transform duration-[var(--motion-standard)] group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
            </ViewTransitionLink>

            <ViewTransitionLink
              href="/explorar"
              data-memory-target
              className="group flex min-h-48 items-end justify-between gap-8 px-1 py-8 transition-colors duration-[var(--motion-standard)] hover:bg-[color-mix(in_srgb,var(--surface-frost)_38%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--surface-frost)_48%,transparent)] md:px-8"
              aria-label="Explorar el calendario público"
            >
              <span>
                <Eye className="mb-7 h-5 w-5 stroke-[0.9] text-text-muted" aria-hidden="true" />
                <span className="block font-display text-[clamp(2rem,4vw,4.5rem)] font-light leading-none tracking-[-0.045em] text-text-primary">Archivo público</span>
                <span className="mt-3 block text-sm font-light text-text-secondary">Recorrer sueños publicados</span>
              </span>
              <ArrowUpRight className="mb-1 h-6 w-6 shrink-0 stroke-[0.9] transition-transform duration-[var(--motion-standard)] group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
            </ViewTransitionLink>
          </div>

          <div className="mt-16 flex flex-col gap-5 text-[0.68rem] uppercase tracking-[0.25em] text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-3"><PenLine className="h-3.5 w-3.5 stroke-[1]" aria-hidden="true" /> Escribir antes de publicar</span>
            <span>Onirc / archivo de sueños</span>
          </div>
        </section>
      </article>
    </PageTransition>
  );
}
