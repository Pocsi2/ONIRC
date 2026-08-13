"use client";

import { ArrowRight, CalendarDays, Feather } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { DreamPearl } from "@/components/dream-pearl";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { dreams, featuredDream, formatDreamDate } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

export function HomeExperience() {
  const reducedMotion = useReducedMotion();
  const { dreams: storedDreams } = useDreamStore();
  const homeDreams = storedDreams.length > 0 ? storedDreams : dreams;
  const homeFeaturedDream = homeDreams.find((dream) => dream.id === featuredDream.id) ?? homeDreams[0] ?? featuredDream;

  return (
    <PageTransition className="grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? reducedTransition : transitions.expressive}
        className="max-w-3xl"
      >
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.34em] text-text-muted">
          Dream Calendar
        </p>
        <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[.88] tracking-[-0.055em] text-text-primary text-balance">
          A place where dreams become visible.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
          ONEIRIC keeps each dream as a small luminous point in time, then lets
          you move closer until the memory takes shape.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <ViewTransitionLink href="/calendar">
              Enter the calendar
              <ArrowRight className="h-4 w-4" />
            </ViewTransitionLink>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <ViewTransitionLink href="/new">
              <Feather className="h-4 w-4" />
              Keep a dream
            </ViewTransitionLink>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reducedMotion ? reducedTransition : { ...transitions.dream, delay: 0.08 }}
        className="relative mx-auto w-full max-w-xl"
      >
        <div className="surface-frost relative overflow-hidden rounded-[44px] p-6 sm:p-8">
          <div className="absolute inset-x-10 top-10 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="mb-12 flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-muted">August 2026</p>
              <h2 className="mt-3 font-display text-5xl leading-none tracking-[-0.04em] text-text-primary">
                Temporal field
              </h2>
            </div>
            <CalendarDays className="h-5 w-5 text-text-muted" />
          </div>

          <div className="relative h-[360px] rounded-[34px] bg-white/30 p-5">
            <div className="absolute inset-7 rounded-full border border-white/55" />
            <div className="absolute inset-x-14 top-1/2 h-px bg-gradient-to-r from-transparent via-[#dedbd4]/70 to-transparent" />
            <div className="absolute inset-y-12 left-1/2 w-px bg-gradient-to-b from-transparent via-white/90 to-transparent" />
            {homeDreams.map((dream, index) => (
              <ViewTransitionLink
                key={dream.id}
                href={`/dreams/${dream.id}`}
                className="group absolute"
                style={{
                  left: `${18 + (index * 17) % 68}%`,
                  top: `${22 + (index * 29) % 58}%`,
                }}
                aria-label={`Open ${dream.title}`}
              >
                <DreamPearl
                  dream={dream}
                  size={dream.id === featuredDream.id ? "lg" : "md"}
                  selected={dream.id === homeFeaturedDream.id}
                  interactive
                  transitionName={`dream-${dream.id}`}
                />
                <span className="motion-standard pointer-events-none absolute left-1/2 top-9 w-40 -translate-x-1/2 rounded-2xl bg-white/70 px-3 py-2 text-center text-xs text-text-secondary opacity-0 shadow-soft backdrop-blur-xl transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  {dream.title}
                </span>
              </ViewTransitionLink>
            ))}
          </div>
        </div>

        <ViewTransitionLink
          href={`/dreams/${homeFeaturedDream.id}`}
          className="surface-opal motion-dream relative -mt-16 ml-auto block max-w-sm rounded-[36px] p-6 transition hover:-translate-y-1 hover:shadow-focus"
        >
          <div className="mb-5 flex items-center gap-3">
            <DreamPearl dream={homeFeaturedDream} size="sm" interactive />
            <span className="text-xs uppercase tracking-[0.24em] text-text-muted">
              {formatDreamDate(homeFeaturedDream.date)}
            </span>
          </div>
          <h3 className="font-display text-4xl leading-none tracking-[-0.035em]">{homeFeaturedDream.title}</h3>
          <p className="mt-4 text-sm leading-6 text-text-secondary">{homeFeaturedDream.summary}</p>
        </ViewTransitionLink>
      </motion.div>
    </PageTransition>
  );
}
