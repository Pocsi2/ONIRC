"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

const HOLD_DURATION = 5000;

export function HoldPublicCalendar() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const frameRef = React.useRef<number | null>(null);
  const startedAtRef = React.useRef(0);
  const [progress, setProgress] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const [hinting, setHinting] = React.useState(false);

  const cancel = React.useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  const complete = React.useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setProgress(1);
    setHolding(false);
    window.setTimeout(() => router.push("/explorar"), reducedMotion ? 0 : 260);
  }, [reducedMotion, router]);

  const begin = React.useCallback(() => {
    if (holding) return;
    if (reducedMotion) {
      complete();
      return;
    }
    startedAtRef.current = performance.now();
    setHolding(true);
    const update = (time: number) => {
      const next = Math.min(1, (time - startedAtRef.current) / HOLD_DURATION);
      setProgress(next);
      if (next >= 1) complete();
      else frameRef.current = window.requestAnimationFrame(update);
    };
    frameRef.current = window.requestAnimationFrame(update);
  }, [complete, holding, reducedMotion]);

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

  const circumference = 2 * Math.PI * 27;
  const visibleProgress = holding ? progress : hinting ? 0.22 : 0.035;

  return (
    <div className="relative">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-surface bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,.78),rgba(230,59,87,.08)_24%,transparent_58%)] backdrop-blur-[2px]"
        animate={{ opacity: holding ? Math.min(0.82, progress + 0.12) : 0 }}
        transition={reducedMotion ? reducedTransition : transitions.standard}
      />
      <motion.button
        type="button"
        data-memory-target
        className="group relative z-calendar grid h-[7.25rem] w-[7.25rem] touch-none place-items-center rounded-full border border-[var(--border-light)] bg-[color-mix(in_srgb,var(--surface-canvas)_72%,transparent)] text-text-primary shadow-soft backdrop-blur-md sm:h-32 sm:w-32"
        aria-label={reducedMotion ? "Abrir calendario público" : "Mantén presionado cinco segundos para abrir el calendario público"}
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
        animate={holding && !reducedMotion ? { scale: [1, 0.985, 1.015], boxShadow: `0 28px ${70 + progress * 70}px rgba(230,59,87,${0.08 + progress * 0.14})` } : { scale: 1 }}
        transition={reducedMotion ? reducedTransition : { duration: 1.1, repeat: holding ? Infinity : 0, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r="27" pathLength="1" fill="none" stroke="var(--border-quiet)" strokeWidth="0.65" vectorEffect="non-scaling-stroke" />
          <motion.circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-memory-electric)" strokeWidth="1" strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset: circumference * (1 - visibleProgress), opacity: holding ? 1 : hinting ? 0.72 : 0.24 }} transition={reducedMotion ? reducedTransition : transitions.expressive} vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.span className="absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,.92),rgba(220,239,233,.38)_44%,rgba(230,224,237,.22)_70%,transparent)]" animate={holding && !reducedMotion ? { rotate: progress * 180, filter: `blur(${2 + progress * 5}px)` } : { rotate: 0, filter: "blur(1px)" }} />
        <span className="relative grid place-items-center">
          <CalendarDays className="h-7 w-7 stroke-[1.15] transition-colors duration-[var(--motion-expressive)] group-hover:text-memory-electric group-focus-visible:text-memory-electric" />
        </span>
        <motion.span aria-hidden="true" className="absolute left-1/2 top-1/2 h-px origin-left bg-memory-electric" style={{ width: `${22 + progress * 46}%` }} animate={{ rotate: holding ? 300 + progress * 480 : 24, opacity: holding ? 0.82 : 0.36 }} transition={{ duration: 0.18 }} />
      </motion.button>
      <p id="public-calendar-instruction" className="sr-only">{reducedMotion ? "Activa para abrir el calendario público." : "Mantén presionado cinco segundos para abrir el calendario público."}</p>
    </div>
  );
}
