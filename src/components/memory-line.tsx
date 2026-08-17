"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

type Point = { x: number; y: number };

export function MemoryLine() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const [target, setTarget] = React.useState<Point | null>(null);

  React.useEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    const locate = (event: Event) => {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-memory-target]") : null;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    };
    const release = (event: Event) => {
      const next = event instanceof FocusEvent ? event.relatedTarget : null;
      if (next instanceof Element && next.closest("[data-memory-target]")) return;
      setTarget(null);
    };

    measure();
    window.addEventListener("resize", measure);
    document.addEventListener("pointerover", locate);
    document.addEventListener("focusin", locate);
    document.addEventListener("pointerout", release);
    document.addEventListener("focusout", release);
    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("pointerover", locate);
      document.removeEventListener("focusin", locate);
      document.removeEventListener("pointerout", release);
      document.removeEventListener("focusout", release);
    };
  }, []);

  const rest = { x: viewport.width + 90, y: Math.max(38, viewport.height * 0.12) };
  const end = target ?? rest;
  const startY = Math.min(viewport.height * 0.68, 620);
  const path = `M ${viewport.width + 72} ${startY} C ${viewport.width * 0.9} ${startY - 90}, ${end.x + 80} ${end.y + 72}, ${end.x} ${end.y}`;

  if (!viewport.width) return null;

  return (
    <svg className="pointer-events-none fixed inset-0 z-navigation h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="memory-line-gradient" x1="0" x2="1">
          <stop offset="0" stopColor="rgba(230,59,87,0)" />
          <stop offset="0.55" stopColor="rgba(230,59,87,.82)" />
          <stop offset="1" stopColor="rgba(247,241,231,.96)" />
        </linearGradient>
        <filter id="memory-line-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.path
        key={pathname}
        d={path}
        fill="none"
        stroke="url(#memory-line-gradient)"
        strokeWidth="1.35"
        strokeLinecap="round"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, pathLength: 0.18 }}
        animate={{ opacity: target ? 0.9 : 0.36, pathLength: target ? 1 : 0.58, d: path }}
        transition={reducedMotion ? reducedTransition : target ? transitions.expressive : transitions.dream}
        filter={target && !reducedMotion ? "url(#memory-line-glow)" : undefined}
      />
      <motion.circle
        cx={end.x}
        cy={end.y}
        r={target ? 3.2 : 1.6}
        fill={target ? "#f7f1e7" : "#e63b57"}
        animate={{ cx: end.x, cy: end.y, opacity: target ? 1 : 0.45, scale: target ? 1 : 0.75 }}
        transition={reducedMotion ? reducedTransition : transitions.expressive}
      />
    </svg>
  );
}
