"use client";

import * as React from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { DreamPearl } from "@/components/dream-pearl";
import { ViewTransitionLink } from "@/components/view-transition-link";
import {
  dreams,
  dreamsByDay,
  featuredDream,
  formatDreamDate,
  shortDreamDate,
  visualSavedDream,
} from "@/lib/dreams";
import { transitions } from "@/lib/motion/tokens";
import { calendarRecede, softReveal } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const daysInMonth = Array.from({ length: 31 }, (_, index) => index + 1);

export function DreamCalendar({
  revealKeptDream = false,
  highlightDreamId,
}: {
  revealKeptDream?: boolean;
  highlightDreamId?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [focusedDreamId, setFocusedDreamId] = React.useState<string | null>(null);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(
    highlightDreamId ?? (revealKeptDream ? visualSavedDream.id : null),
  );

  const calendarDreams = React.useMemo(
    () => (revealKeptDream ? [...dreams, visualSavedDream] : dreams),
    [revealKeptDream],
  );
  const dreamMap = dreamsByDay(calendarDreams);

  React.useEffect(() => {
    if (!highlightedId) return;
    const timer = window.setTimeout(() => setHighlightedId(null), 1200);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const isReceded = focusedDreamId !== null;

  return (
    <PageTransition className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.expressive}
        className="z-calendar min-w-0"
      >
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-text-muted">
              Calendar
            </p>
            <h1 className="mt-4 font-display text-[clamp(3.25rem,8vw,7rem)] leading-[.9] tracking-[-0.055em]">
              August, softly remembered.
            </h1>
          </div>
          <div className="surface-frost flex w-fit items-center gap-1 rounded-[22px] p-1">
            <Button variant="ghost" size="sm" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm text-text-secondary">2026</span>
            <Button variant="ghost" size="sm" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <motion.div
          animate={isReceded ? "receded" : "rest"}
          initial="rest"
          variants={calendarRecede}
          className="surface-frost relative overflow-hidden rounded-[44px] p-4 sm:p-8 lg:p-10"
        >
          <div className="absolute inset-x-12 top-20 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          <div className="absolute left-[8%] top-[24%] h-[58%] w-[84%] rounded-[50%] border border-white/45" />
          <div className="absolute left-[15%] top-[34%] h-[36%] w-[70%] rounded-[50%] border border-[#e8e7e4]/35" />

          <div className="relative grid grid-cols-7 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6">
            {weekDays.map((day) => (
              <div key={day} className="pb-3 text-center text-[11px] uppercase tracking-[0.2em] text-text-muted">
                {day}
              </div>
            ))}
            {daysInMonth.map((day) => {
              const dayDreams = dreamMap[day] ?? [];
              const hasDream = dayDreams.length > 0;
              const isKeptDay = revealKeptDream && day === 28;

              return (
                <div
                  key={day}
                  className={cn(
                    "motion-standard relative flex min-h-[76px] items-center justify-center rounded-[28px] transition sm:min-h-[96px]",
                    hasDream ? "bg-white/24" : "bg-white/[0.10]",
                    isReceded && hasDream && !dayDreams.some((d) => d.id === focusedDreamId) && "opacity-40",
                  )}
                >
                  <span className={cn("absolute left-3 top-3 text-xs", hasDream ? "text-text-secondary" : "text-text-muted/70")}>
                    {day}
                  </span>
                  {hasDream ? (
                    <div className="relative flex min-h-12 min-w-12 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-white/40 blur-xl" />
                      {dayDreams.map((dream, index) => {
                        const isSelected =
                          dream.id === highlightedId ||
                          dream.id === focusedDreamId;
                        const isNewKept = isKeptDay && dream.id === visualSavedDream.id && revealKeptDream;

                        return (
                          <ViewTransitionLink
                            key={dream.id}
                            href={`/dreams/${dream.id}`}
                            className="group absolute rounded-full p-4"
                            style={{
                              transform: `translate(${(index - (dayDreams.length - 1) / 2) * 12}px, ${index % 2 ? 7 : -4}px)`,
                            }}
                            aria-label={`Open dream: ${dream.title}, ${formatDreamDate(dream.date)}`}
                            onBeforeTransition={() => setFocusedDreamId(dream.id)}
                          >
                            {isNewKept ? (
                              <Reveal delay={0.3}>
                                <DreamPearl
                                  dream={dream}
                                  size={dayDreams.length > 1 ? "md" : "lg"}
                                  interactive
                                  multiple={dayDreams.length > 1}
                                  selected={isSelected}
                                />
                              </Reveal>
                            ) : (
                              <DreamPearl
                                dream={dream}
                                size={dayDreams.length > 1 ? "md" : "lg"}
                                interactive
                                multiple={dayDreams.length > 1}
                                selected={isSelected}
                              />
                            )}
                            <span className="sr-only">{dream.title}</span>
                            <span className="motion-standard pointer-events-none absolute left-1/2 top-12 z-feedback w-44 -translate-x-1/2 rounded-2xl bg-white/80 px-3 py-2 text-center text-xs leading-5 text-text-secondary opacity-0 shadow-soft backdrop-blur-xl transition group-hover:opacity-100 group-focus-visible:opacity-100">
                              {dream.title}
                            </span>
                          </ViewTransitionLink>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#dedbd4]/55" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.aside
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transitions.expressive, delay: 0.12 }}
        className="z-surface lg:sticky lg:top-28 lg:self-start"
      >
        <div className="surface-opal overflow-hidden rounded-[42px] p-7">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DreamPearl dream={featuredDream} size="lg" selected interactive />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted">
                  nearest memory
                </p>
                <p className="mt-1 text-sm text-text-secondary">{shortDreamDate(featuredDream.date)}</p>
              </div>
            </div>
            <Moon className="h-4 w-4 text-text-muted" />
          </div>

          <h2 className="font-display text-5xl leading-[.95] tracking-[-0.045em]">
            {featuredDream.title}
          </h2>
          <p className="mt-5 text-sm leading-7 text-text-secondary">{featuredDream.summary}</p>
          <ViewTransitionLink
            href={`/dreams/${featuredDream.id}`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-text-primary"
            onBeforeTransition={() => setFocusedDreamId(featuredDream.id)}
          >
            Move closer
            <ArrowRight className="h-4 w-4" />
          </ViewTransitionLink>
        </div>

        <Reveal variants={softReveal} delay={0.2} className="mt-6">
          <div className="rounded-[34px] border border-white/55 bg-white/35 p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted">How to read it</p>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Empty days stay nearly silent. Dream days glow as pearls. A cluster
              means more than one memory surfaced on the same date.
            </p>
          </div>
        </Reveal>
      </motion.aside>
    </PageTransition>
  );
}
