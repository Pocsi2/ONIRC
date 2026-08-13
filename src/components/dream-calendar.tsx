"use client";

import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CloudCurtain } from "@/components/cloud-curtain";
import { DreamCollection } from "@/components/dream-collection";
import { DreamComposer } from "@/components/dream-composer";
import { DreamFocus } from "@/components/dream-focus";
import { DreamPearl } from "@/components/dream-pearl";
import { Button } from "@/components/ui/button";
import { formatDreamDate, monthKeyForDate, monthLabel, todayIso, type Dream } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";
import { calendarRecede, withReducedMotion } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function keyForMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthFromKey(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

function dateForDay(month: Date, day: number) {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function mondayOffset(month: Date) {
  return (month.getDay() + 6) % 7;
}

function daysInMonth(month: Date) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

type Toast = { dream: Dream; kind: "deleted" | "saved" } | null;

export function DreamCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const { dreams, isReady, persistence, removeDream, restoreDream, resetDreams } = useDreamStore();
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<Toast>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const previousDreamRef = React.useRef<string | null>(null);

  const currentMonth = monthFromKey(searchParams.get("month")) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const currentMonthKey = keyForMonth(currentMonth);
  const selectedDreamId = searchParams.get("dream");
  const selectedDream = dreams.find((dream) => dream.id === selectedDreamId);
  const selectedCollectionDate = searchParams.get("collection");
  const composeValue = searchParams.get("compose");
  const composeMode = composeValue === "edit" && selectedDream ? "edit" : composeValue === "new" ? "create" : null;
  const requestedDate = searchParams.get("date");
  const composerDate = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= todayIso() ? requestedDate : todayIso();
  const dayCount = daysInMonth(currentMonth);
  const calendarVariants = withReducedMotion(calendarRecede, reducedMotion);
  const dreamMap = (() => {
    const result = new Map<string, Dream[]>();
    dreams
      .filter((dream) => monthKeyForDate(dream.date) === currentMonthKey)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .forEach((dream) => result.set(dream.date, [...(result.get(dream.date) ?? []), dream]));
    return result;
  })();
  const selectedCollection = selectedCollectionDate ? dreamMap.get(selectedCollectionDate) ?? [] : [];

  const updateUrl = React.useCallback((changes: Record<string, string | null>, mode: "push" | "replace" = "push") => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    const href = query ? `/calendar?${query}` : "/calendar";
    if (mode === "replace") router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }, [router, searchParams]);

  React.useEffect(() => {
    if (!isReady) return;
    if (selectedDreamId && !selectedDream) updateUrl({ dream: null, compose: null }, "replace");
    if (selectedCollectionDate && selectedCollection.length < 2) updateUrl({ collection: null }, "replace");
  }, [isReady, selectedCollection.length, selectedCollectionDate, selectedDream, selectedDreamId, updateUrl]);

  React.useEffect(() => {
    if (selectedDream) previousDreamRef.current = selectedDream.id;
    if (!selectedDream && previousDreamRef.current) {
      const origin = previousDreamRef.current;
      previousDreamRef.current = null;
      window.setTimeout(() => document.getElementById(`dream-pearl-${origin}`)?.focus(), 60);
    }
  }, [selectedDream]);

  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function moveMonth(amount: number) {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1);
    updateUrl({ month: keyForMonth(next), dream: null, collection: null, compose: null, date: null });
  }

  function openComposer(date = todayIso()) {
    updateUrl({ compose: "new", date, dream: null, collection: null });
  }

  function closeComposer() {
    updateUrl({ compose: null, date: null });
  }

  function closeFocus() {
    updateUrl({ dream: null, collection: null, compose: null });
  }

  function handleSaved(dream: Dream) {
    setHighlightedId(dream.id);
    setToast({ dream, kind: "saved" });
    updateUrl({ month: monthKeyForDate(dream.date), compose: null, date: null, dream: null, collection: null });
    window.setTimeout(() => setHighlightedId(null), 1800);
  }

  function handleDelete(dream: Dream) {
    const removed = removeDream(dream.id);
    if (!removed) return;
    setToast({ dream: removed, kind: "deleted" });
    closeFocus();
  }

  const isCalendarEmpty = isReady && dreams.length === 0;
  const isMonthEmpty = isReady && dreamMap.size === 0;

  return (
    <LayoutGroup id="calendar-memory">
      <div className="relative pb-28">
        <motion.div animate={selectedDream || selectedCollection.length > 1 ? "receded" : "rest"} initial="rest" variants={calendarVariants} className="z-calendar">
          <div className="mx-auto max-w-[1080px]">
            <div className="mb-10 flex flex-col gap-7 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-text-muted">Mi calendario local</p>
                <h1 className="mt-4 font-display text-balance text-[clamp(3.6rem,8vw,7.5rem)] leading-[.88] tracking-[-0.06em]">{monthLabel(currentMonth)}</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">Cada perla señala un sueño que existe sólo en este navegador.</p>
                {persistence.message ? <p role="status" aria-live="polite" className={cn("mt-3 text-sm leading-6", persistence.kind === "warning" ? "text-memory-accessible" : "text-text-muted")}>{persistence.message}</p> : null}
              </div>
              <div className="surface-frost flex w-fit items-center gap-1 rounded-[20px] p-1" aria-label="Navegar meses">
                <button type="button" className="material-button grid h-11 w-11 place-items-center rounded-[14px]" aria-label="Mes anterior" onClick={() => moveMonth(-1)}><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" className="min-h-11 rounded-[14px] px-3 text-sm text-text-secondary hover:bg-white/35" onClick={() => updateUrl({ month: keyForMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), dream: null, collection: null, compose: null })}>Hoy</button>
                <button type="button" className="material-button grid h-11 w-11 place-items-center rounded-[14px]" aria-label="Mes siguiente" onClick={() => moveMonth(1)}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            <section aria-label={`Calendario de ${monthLabel(currentMonth)}`} className="surface-frost relative overflow-hidden rounded-[32px] p-3 sm:rounded-[44px] sm:p-7 lg:p-10">
              <div className="pointer-events-none absolute left-[8%] top-[20%] h-[62%] w-[84%] rounded-[50%] border border-white/38 [html[data-theme=night]_&]:border-white/[.08]" />
              <div className="pointer-events-none absolute left-[16%] top-[35%] h-[32%] w-[68%] rounded-[50%] border border-white/28 [html[data-theme=night]_&]:border-white/[.06]" />
              <div className="relative grid grid-cols-7 gap-x-1 gap-y-2 sm:gap-x-3 sm:gap-y-5">
                {weekDays.map((day) => <p key={day} className="pb-2 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-text-muted sm:text-[11px] sm:tracking-[0.2em]">{day}</p>)}
                {Array.from({ length: mondayOffset(currentMonth) }).map((_, index) => <div key={`blank-${index}`} aria-hidden="true" className="min-h-[60px] sm:min-h-[82px]" />)}
                {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => {
                  const date = dateForDay(currentMonth, day);
                  const dayDreams = dreamMap.get(date) ?? [];
                  const hasDreams = dayDreams.length > 0;
                  const isToday = date === todayIso();
                  return (
                    <div key={date} className={cn("relative flex min-h-[60px] items-center justify-center rounded-[20px] sm:min-h-[82px] sm:rounded-[26px]", hasDreams ? "bg-white/22 [html[data-theme=night]_&]:bg-white/[.045]" : "bg-white/[.065] [html[data-theme=night]_&]:bg-white/[.018]", isToday && "ring-1 ring-memory-electric/55 ring-offset-2 ring-offset-transparent") }>
                      <span className={cn("absolute left-2.5 top-2 text-[11px] sm:left-3 sm:top-3 sm:text-xs", hasDreams ? "text-text-secondary" : "text-text-muted")}>{day}</span>
                      {hasDreams && dayDreams.length === 1 ? (
                        <div className="relative flex h-12 w-full items-center justify-center">
                          {dayDreams.map((dream) => (
                            <button
                              id={`dream-pearl-${dream.id}`}
                              key={dream.id}
                              type="button"
                              className="group absolute grid min-h-11 min-w-11 place-items-center rounded-full"
                              aria-label={`Abrir sueño: ${dream.title}, ${formatDreamDate(dream.date)}`}
                              onClick={() => updateUrl({ dream: dream.id, compose: null })}
                            >
                              <DreamPearl dream={dream} size="lg" interactive selected={highlightedId === dream.id} focused={selectedDreamId === dream.id} layoutId={`pearl-${dream.id}`} />
                              <span className="pointer-events-none absolute top-[calc(100%+0.3rem)] z-feedback hidden w-40 rounded-[14px] bg-[var(--surface-canvas)] px-3 py-2 text-center text-xs leading-5 text-text-secondary shadow-soft group-hover:block group-focus-visible:block sm:block sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">{dream.title}</span>
                            </button>
                          ))}
                        </div>
                      ) : hasDreams ? (
                        <button type="button" className="group relative flex min-h-11 min-w-12 items-center justify-center rounded-full" aria-label={`Abrir ${dayDreams.length} sueños del ${formatDreamDate(date)}`} onClick={() => updateUrl({ collection: date, dream: null, compose: null })}>
                          {dayDreams.slice(0, 3).map((dream, index) => <span key={dream.id} className="absolute" style={{ transform: `translate(${(index - (Math.min(dayDreams.length, 3) - 1) / 2) * 10}px, ${index % 2 ? 4 : -3}px)` }}><DreamPearl dream={dream} size="md" multiple interactive /></span>)}
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--surface-canvas)] px-1.5 py-0.5 text-[10px] font-medium text-text-secondary shadow-soft">{dayDreams.length}</span>
                        </button>
                      ) : <span className="h-1.5 w-1.5 rounded-full bg-[#d8d5cf]/65 [html[data-theme=night]_&]:bg-white/20" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
              {isMonthEmpty ? (
                <div className="relative mx-auto mt-8 max-w-md px-4 pb-3 text-center sm:mt-10">
                  <p className="font-display text-3xl leading-none">{isCalendarEmpty ? "Aquí empieza el tiempo." : "Este mes todavía guarda silencio."}</p>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{isCalendarEmpty ? "Cuando recuerdes uno, corre la nube para registrarlo." : "Puedes volver a otro mes o registrar un sueño que ya recuerdes."}</p>
                </div>
              ) : null}
            </section>
            <div className="mt-8 flex flex-col gap-4 border-t border-white/45 pt-6 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between [html[data-theme=night]_&]:border-white/10">
              <p>Este espacio no sincroniza tus recuerdos ni los comparte.</p>
              {confirmReset ? (
                <span className="flex flex-wrap items-center gap-2 text-text-secondary">
                  <span>¿Dejar el calendario local en blanco?</span>
                  <Button size="sm" variant="secondary" onClick={() => { resetDreams(); setConfirmReset(false); }}>Sí, borrar datos</Button>
                  <button type="button" className="min-h-9 px-2 text-xs underline-offset-4 hover:underline" onClick={() => setConfirmReset(false)}>Cancelar</button>
                </span>
              ) : <button type="button" className="inline-flex min-h-10 items-center gap-2 self-start text-sm underline-offset-4 hover:underline sm:self-auto" onClick={() => setConfirmReset(true)}><RotateCcw className="h-3.5 w-3.5" />Reiniciar datos locales</button>}
            </div>
          </div>
        </motion.div>

        {!selectedDream && selectedCollection.length < 2 && !composeMode ? <div className="fixed bottom-5 right-4 z-surface sm:bottom-7 sm:right-7 lg:right-10"><CloudCurtain onOpen={() => openComposer()} emphasized={isCalendarEmpty} /></div> : null}

        <AnimatePresence>
          {selectedDream && !composeMode ? <DreamFocus key={selectedDream.id} dream={selectedDream} onBack={closeFocus} onEdit={() => updateUrl({ compose: "edit" })} onDelete={() => handleDelete(selectedDream)} /> : null}
          {selectedCollection.length > 1 && !selectedDream && !composeMode ? <DreamCollection key={selectedCollectionDate} date={selectedCollectionDate!} dreams={selectedCollection} onBack={() => updateUrl({ collection: null })} onSelect={(dream) => updateUrl({ collection: null, dream: dream.id })} /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {composeMode ? <DreamComposer key={`${composeMode}-${selectedDream?.id ?? "new"}`} mode={composeMode} dream={composeMode === "edit" ? selectedDream : undefined} initialDate={composeMode === "edit" && selectedDream ? selectedDream.date : composerDate} onClose={closeComposer} onSaved={handleSaved} /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {toast ? (
            <motion.div role="status" aria-live="polite" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reducedMotion ? reducedTransition : transitions.standard} className="surface-frost fixed bottom-5 left-4 z-feedback max-w-[min(27rem,calc(100vw-2rem))] rounded-[20px] p-4 sm:bottom-7 sm:left-7">
              <p className="text-sm leading-6 text-text-secondary">{toast.kind === "saved" ? `“${toast.dream.title}” ya vive en tu calendario.` : `“${toast.dream.title}” salió del calendario.`}</p>
              {toast.kind === "deleted" ? <button type="button" className="mt-2 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-text-primary underline-offset-4 hover:underline" onClick={() => { restoreDream(toast.dream); setToast(null); }}><ArrowLeft className="h-3.5 w-3.5" />Deshacer</button> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
