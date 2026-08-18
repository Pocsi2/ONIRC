"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";

const MAX_FIELD_COVERAGE = 0.92;
const VIEWBOX_SIZE = 1000;

type ElectricTrailProps = {
  className?: string;
};

type PointerSample = {
  active: boolean;
  speed: number;
  x: number;
  y: number;
  sampledAt: number;
};

type ScrollSample = {
  progress: number;
  speed: number;
  y: number;
  sampledAt: number;
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const approach = (current: number, target: number, rate: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-rate * seconds));

export function ElectricTrail({ className }: ElectricTrailProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const corePathRef = React.useRef<SVGPathElement>(null);
  const echoPathRef = React.useRef<SVGPathElement>(null);
  const gradientId = React.useId().replaceAll(":", "");

  const fieldScale = useMotionValue(reducedMotion ? 0.12 : 0.055);
  const fieldOpacity = useMotionValue(reducedMotion ? 0.12 : 0.08);
  const seamX = useMotionValue(0);
  const seamOpacity = useMotionValue(reducedMotion ? 0.32 : 0.18);

  const pointerRef = React.useRef<PointerSample>({
    active: false,
    speed: 0,
    x: 780,
    y: 480,
    sampledAt: 0,
  });
  const scrollRef = React.useRef<ScrollSample>({
    progress: 0,
    speed: 0,
    y: 0,
    sampledAt: 0,
  });
  const viewportRef = React.useRef({ width: 1, height: 1, finePointer: false });

  React.useEffect(() => {
    const root = rootRef.current;
    const corePath = corePathRef.current;
    const echoPath = echoPathRef.current;
    if (!root || !corePath || !echoPath) return;

    const measure = () => {
      viewportRef.current = {
        width: Math.max(window.innerWidth, 1),
        height: Math.max(window.innerHeight, 1),
        finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      };
      seamX.set(viewportRef.current.width * fieldScale.get());
    };

    const sampleScroll = () => {
      const now = performance.now();
      const sample = scrollRef.current;
      const y = window.scrollY;
      const elapsed = Math.max(now - sample.sampledAt, 16);
      const scrollable = Math.max(
        document.documentElement.scrollHeight - viewportRef.current.height,
        1,
      );

      sample.speed = clamp(
        Math.abs(y - sample.y) / elapsed / Math.max(viewportRef.current.height, 1) * 720,
      );
      sample.progress = clamp(y / scrollable);
      sample.y = y;
      sample.sampledAt = now;
    };

    const samplePointer = (event: PointerEvent) => {
      if (!viewportRef.current.finePointer || event.pointerType === "touch") return;

      const now = performance.now();
      const sample = pointerRef.current;
      const x = clamp(event.clientX / viewportRef.current.width) * VIEWBOX_SIZE;
      const y = clamp(event.clientY / viewportRef.current.height) * VIEWBOX_SIZE;
      const elapsed = Math.max(now - sample.sampledAt, 8);
      const distance = Math.hypot(x - sample.x, y - sample.y) / VIEWBOX_SIZE;

      sample.speed = clamp(distance / elapsed * 520);
      sample.x = x;
      sample.y = y;
      sample.active = true;
      sample.sampledAt = now;
    };

    const releasePointer = () => {
      pointerRef.current.active = false;
    };

    measure();
    sampleScroll();

    if (reducedMotion) {
      const staticPath = "M 120 620 C 340 420 650 370 910 470";
      fieldScale.set(0.12);
      fieldOpacity.set(0.12);
      seamOpacity.set(0.32);
      corePath.setAttribute("d", staticPath);
      echoPath.setAttribute("d", staticPath);
      corePath.style.strokeDashoffset = "0.42";
      echoPath.style.strokeDashoffset = "0.54";
      seamX.set(viewportRef.current.width * 0.12);
      root.style.setProperty("--electric-energy", "0");
      return;
    }

    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", sampleScroll, { passive: true });
    window.addEventListener("pointermove", samplePointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", releasePointer, { passive: true });

    let frame = 0;
    let previousFrame = performance.now();
    let energy = 0;
    let coverage = fieldScale.get();
    let endX = pointerRef.current.x;
    let endY = pointerRef.current.y;

    const render = (now: number) => {
      const seconds = Math.min((now - previousFrame) / 1000, 0.05);
      previousFrame = now;

      const pointer = pointerRef.current;
      const scroll = scrollRef.current;
      pointer.speed *= Math.exp(-4.6 * seconds);
      scroll.speed *= Math.exp(-5.2 * seconds);

      const inputEnergy = clamp(
        (viewportRef.current.finePointer ? pointer.speed * 0.78 : 0) + scroll.speed * 0.9,
      );
      energy = approach(energy, inputEnergy, inputEnergy > energy ? 10 : 2.7, seconds);

      const chapterPulse = Math.sin(scroll.progress * Math.PI);
      const targetCoverage = clamp(
        0.055 + chapterPulse * 0.57 + energy * 0.39,
        0.055,
        MAX_FIELD_COVERAGE,
      );
      coverage = approach(coverage, targetCoverage, targetCoverage > coverage ? 4.8 : 2.1, seconds);

      fieldScale.set(Math.min(coverage, MAX_FIELD_COVERAGE));
      fieldOpacity.set(clamp(0.08 + chapterPulse * 0.22 + energy * 0.5, 0.08, 0.76));
      seamOpacity.set(clamp(0.18 + energy * 0.7 + chapterPulse * 0.12, 0.18, 0.88));
      seamX.set(viewportRef.current.width * Math.min(coverage, MAX_FIELD_COVERAGE));

      const mobile = !viewportRef.current.finePointer;
      const targetX = mobile
        ? 790 - scroll.progress * 500
        : pointer.active
          ? pointer.x
          : 760;
      const targetY = mobile
        ? 250 + Math.sin(scroll.progress * Math.PI * 1.6) * 430
        : pointer.active
          ? pointer.y
          : 520;
      endX = approach(endX, targetX, 5.5, seconds);
      endY = approach(endY, targetY, 5.5, seconds);

      const originX = clamp(coverage, 0.055, MAX_FIELD_COVERAGE) * VIEWBOX_SIZE;
      const originY = 470 - chapterPulse * 110;
      const bend = (endY - originY) * 0.22;
      const path = [
        `M ${originX.toFixed(2)} ${originY.toFixed(2)}`,
        `C ${(originX - 130 - energy * 120).toFixed(2)} ${(originY + bend).toFixed(2)},`,
        `${(endX + 150 + energy * 90).toFixed(2)} ${(endY - bend).toFixed(2)},`,
        `${endX.toFixed(2)} ${endY.toFixed(2)}`,
      ].join(" ");
      const visibleLength = clamp(0.14 + chapterPulse * 0.15 + energy * 0.71, 0.14, 1);

      corePath.setAttribute("d", path);
      echoPath.setAttribute("d", path);
      corePath.style.strokeDashoffset = String(1 - visibleLength);
      echoPath.style.strokeDashoffset = String(1 - visibleLength * 0.86);
      corePath.style.strokeWidth = String(1.1 + energy * 1.25);
      corePath.style.opacity = String(clamp(0.34 + energy * 0.66, 0.34, 1));
      echoPath.style.strokeWidth = String(3.4 + energy * 2.2);
      echoPath.style.opacity = String(clamp(0.08 + energy * 0.16, 0.08, 0.24));
      root.style.setProperty("--electric-energy", energy.toFixed(3));

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", sampleScroll);
      window.removeEventListener("pointermove", samplePointer);
      document.documentElement.removeEventListener("pointerleave", releasePointer);
    };
  }, [fieldOpacity, fieldScale, reducedMotion, seamOpacity, seamX]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 isolate overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0 origin-left"
        style={{
          background:
            "linear-gradient(108deg, rgba(174, 3, 31, .96) 0%, rgba(220, 20, 52, .94) 58%, rgba(235, 46, 72, .82) 86%, rgba(230, 59, 87, .18) 100%)",
          opacity: fieldOpacity,
          scaleX: fieldScale,
          willChange: "transform, opacity",
        }}
      />

      <motion.div
        className="absolute top-1/2 h-[132vh] w-[clamp(34px,6vw,112px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/35"
        style={{
          background:
            "linear-gradient(90deg, rgba(230,59,87,.14), rgba(255,252,246,.72) 48%, rgba(255,255,255,0) 76%)",
          boxShadow: "inset 1px 0 rgba(255,255,255,.46)",
          opacity: seamOpacity,
          x: seamX,
          willChange: "transform, opacity",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(230,59,87,0)" />
            <stop offset="0.42" stopColor="rgba(255,32,68,.94)" />
            <stop offset="0.82" stopColor="rgba(246,45,75,1)" />
            <stop offset="1" stopColor="rgba(255,250,240,.98)" />
          </linearGradient>
        </defs>
        <path
          ref={echoPathRef}
          d="M 80 470 C 310 390 610 410 780 480"
          fill="none"
          pathLength="1"
          stroke="rgba(240, 30, 66, .24)"
          strokeDasharray="1"
          strokeDashoffset=".86"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={corePathRef}
          d="M 80 470 C 310 390 610 410 780 480"
          fill="none"
          pathLength="1"
          stroke={`url(#${gradientId})`}
          strokeDasharray="1"
          strokeDashoffset=".86"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
