"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { isPublicArchiveAvailable } from "@/lib/archive-state";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

const HOLD_DURATION = 5000;

export function HoldPublicCalendar() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const frameRef = React.useRef<number | null>(null);
  const startedAtRef = React.useRef(0);
  const progress = useMotionValue(0.035);
  const [holding, setHolding] = React.useState(false);
  const [hinting, setHinting] = React.useState(false);
  const calendarName = isPublicArchiveAvailable ? "calendario público" : "calendario privado";
  const targetHref = isPublicArchiveAvailable ? "/explorar" : "/calendar";
  const circumference = 2 * Math.PI * 27;
  const ringOffset = useTransform(progress, (value) => circumference * (1 - value));
  const fieldOpacity = useTransform(progress, [0, 1], [0.08, 0.8]);
  const lineWidth = useTransform(progress, [0, 1], ["22%", "68%"]);
  const lineRotation = useTransform(progress, [0, 1], [24, 780]);

  React.useEffect(() => {
    router.prefetch(targetHref);
  }, [router, targetHref]);

  const cancel = React.useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setHolding(false);
    progress.set(hinting ? 0.22 : 0.035);
  }, [hinting, progress]);

  const complete = React.useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    progress.set(1);
    setHolding(false);
    router.push(targetHref);
  }, [progress, router, targetHref]);

  const begin = React.useCallback(() => {
    if (holding) return;
    if (reducedMotion) {
      complete();
      return;
    }
    startedAtRef.current = performance.now();
    progress.set(0);
    setHolding(true);
    const update = (time: number) => {
      const next = Math.min(1, (time - startedAtRef.current) / HOLD_DURATION);
      progress.set(next);
      if (next >= 1) complete();
      else frameRef.current = window.requestAnimationFrame(update);
    };
    frameRef.current = window.requestAnimationFrame(update);
  }, [complete, holding, progress, reducedMotion]);

  React.useEffect(() => () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }, []);

  React.useEffect(() => {
    if (reducedMotion) return;
    const startHint = window.setTimeout(() => setHinting(true), 850);
    const stopHint = window.setTimeout(() => setHinting(false), 2450);
    return () => {
      window.clearTimeout(startHint);
      window.clearTimeout(stopHint);
    };
  }, [reducedMotion]);

  React.useEffect(() => {
    if (!holding) progress.set(hinting ? 0.22 : 0.035);
  }, [hinting, holding, progress]);

  return (
    <div className="relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-surface bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,.76),rgba(230,59,87,.08)_24%,transparent_58%)]"
        style={{ opacity: holding ? fieldOpacity : 0 }}
        transition={reducedMotion ? reducedTransition : transitions.standard}
      />
      <motion.button
        type="button"
        data-memory-target
        className="group relative z-calendar grid h-[7.25rem] w-[7.25rem] touch-none place-items-center rounded-full border border-[color-mix(in_srgb,var(--calendar-line)_42%,transparent)] bg-transparent text-text-primary backdrop-blur-[1px] sm:h-32 sm:w-32"
        aria-label={reducedMotion ? `Abrir ${calendarName}` : `Mantén presionado cinco segundos para abrir el ${calendarName}`}
        aria-describedby="public-calendar-instruction"
        onPointerEnter={() => setHinting(true)}
        onPointerLeave={() => { if (!holding) setHinting(false); }}
        onFocus={() => setHinting(true)}
        onBlur={() => { if (!holding) setHinting(false); }}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); begin(); }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            begin();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            cancel();
          }
        }}
        animate={holding && !reducedMotion ? { scale: 0.985 } : { scale: 1 }}
        transition={reducedMotion ? reducedTransition : transitions.fast}
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r="27" pathLength="1" fill="none" stroke="var(--calendar-line)" strokeWidth="0.42" opacity="0.46" vectorEffect="non-scaling-stroke" />
          <motion.circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-memory-electric)" strokeWidth="0.62" strokeLinecap="round" strokeDasharray={circumference} style={{ strokeDashoffset: ringOffset }} animate={{ opacity: holding ? 0.88 : hinting ? 0.5 : 0.14 }} transition={reducedMotion ? reducedTransition : transitions.fast} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="relative grid place-items-center">
          <CalendarDays className="h-7 w-7 stroke-[0.82] opacity-60 transition-[color,opacity] duration-[var(--motion-expressive)] group-hover:text-memory-electric group-hover:opacity-90 group-focus-visible:text-memory-electric group-focus-visible:opacity-90" />
        </span>
        <motion.span aria-hidden="true" className="absolute left-1/2 top-1/2 h-px origin-left bg-memory-electric" style={{ width: lineWidth, rotate: lineRotation }} animate={{ opacity: holding ? 0.82 : 0.36 }} transition={reducedMotion ? reducedTransition : transitions.fast} />
      </motion.button>
      <p id="public-calendar-instruction" className="sr-only">{reducedMotion ? `Activa para abrir el ${calendarName}.` : `Mantén presionado cinco segundos para abrir el ${calendarName}.`}</p>
    </div>
  );
}
