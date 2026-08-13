"use client";

import * as React from "react";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Sparkles, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { DreamPearl } from "@/components/dream-pearl";
import { ViewTransitionLink } from "@/components/view-transition-link";
import type { Dream } from "@/lib/dreams";
import { formatDreamDate } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";
import { dreamReveal, staggeredDreamReveal } from "@/lib/motion/variants";

export function DreamDetail({ dream }: { dream: Dream }) {
  const reducedMotion = useReducedMotion();
  const { removeDream } = useDreamStore();
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  return (
    <PageTransition className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      <motion.aside
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? reducedTransition : transitions.expressive}
        className="z-surface lg:sticky lg:top-32 lg:self-start"
      >
        <Button asChild variant="secondary">
          <ViewTransitionLink href="/calendar" aria-label={`Return from ${dream.title} to the calendar`}>
            <ArrowLeft className="h-4 w-4" />
            Back to calendar
          </ViewTransitionLink>
        </Button>

        <div className="surface-frost mt-8 rounded-[40px] p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Memory coordinates</p>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Date
              </dt>
              <dd className="text-sm leading-6 text-text-secondary">{formatDreamDate(dream.date)}</dd>
            </div>
            <div>
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                Feeling
              </dt>
              <dd className="text-sm leading-6 text-text-secondary">{dream.feeling}</dd>
            </div>
            <div>
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-muted">
                <MapPin className="h-3.5 w-3.5" />
                Place
              </dt>
              <dd className="text-sm leading-6 text-text-secondary">{dream.place}</dd>
            </div>
          </dl>
        </div>
        <Button asChild variant="ghost" className="mt-5 w-full justify-start">
          <ViewTransitionLink href={`/dreams/${dream.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit this memory
          </ViewTransitionLink>
        </Button>
      </motion.aside>

      <motion.div
        initial={false}
        animate="visible"
        variants={
          reducedMotion
            ? {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: transitions.instant },
              }
            : dreamReveal
        }
        className="surface-opal relative z-focus overflow-hidden rounded-[48px] px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
      >
        <div className="absolute inset-x-16 top-16 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-mist-cyan/30 blur-3xl" />

        <div className="relative">
          <div className="mb-12 flex items-center justify-between gap-8">
            <DreamPearl dream={dream} size="xl" selected transitionName={`dream-${dream.id}`} />
            <p className="max-w-[220px] text-right text-xs uppercase leading-6 tracking-[0.24em] text-text-muted">
              preserved as light inside August
            </p>
          </div>

          <motion.p
            initial={false}
            animate="visible"
            variants={
              reducedMotion
                ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { ...reducedTransition, delay: 0.2 } } }
                : staggeredDreamReveal(0.2)
            }
            className="text-sm text-text-muted"
          >
            {formatDreamDate(dream.date)}
          </motion.p>
          <motion.h1
            initial={false}
            animate="visible"
            variants={
              reducedMotion
                ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { ...reducedTransition, delay: 0.28 } } }
                : staggeredDreamReveal(0.28)
            }
            className="mt-5 max-w-4xl font-display text-[clamp(3.8rem,9vw,8.8rem)] leading-[.86] tracking-[-0.06em] text-text-primary"
          >
            {dream.title}
          </motion.h1>

          <motion.p
            initial={false}
            animate="visible"
            variants={
              reducedMotion
                ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { ...reducedTransition, delay: 0.42 } } }
                : staggeredDreamReveal(0.42)
            }
            className="dream-reading mt-10 text-lg text-text-secondary sm:text-xl"
          >
            {dream.body}
          </motion.p>

          <motion.div
            initial={false}
            animate="visible"
            variants={
              reducedMotion
                ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { ...reducedTransition, delay: 0.52 } } }
                : staggeredDreamReveal(0.52)
            }
            className="mt-14 flex flex-col gap-3 border-t border-white/55 pt-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-text-muted">The calendar is still behind this memory.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary">
                <ViewTransitionLink href="/new">Keep another</ViewTransitionLink>
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Let it go
              </Button>
            </div>
          </motion.div>

          {confirmingDelete ? (
            <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-3 rounded-[22px] border border-white/60 bg-white/55 p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
              <span>Let this memory leave the calendar?</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>Keep it</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    removeDream(dream.id);
                    router.push("/calendar");
                  }}
                >
                  Let it go
                </Button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </PageTransition>
  );
}
