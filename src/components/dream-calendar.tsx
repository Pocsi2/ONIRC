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

function daysInMonth(month: Date) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

type Toast = { dream: Dream; kind: "deleted" | "saved" } | null;

function monthName(month: Date) {
  return new Intl.DateTimeFormat("es-GT", { month: "long" }).format(month);
}

function MonthWheel({ month, onStep, onToday }: { month: Date; onStep: (amount: number) => void; onToday: () => void }) {
  const dragStart = React.useRef<number | null>(null);
  const wheelLock = React.useRef(false);
  const label = new Intl.DateTimeFormat("es-GT", { month: "short" }).format(month).replace(".", "");

  return (
    <button
      type="button"
      className="month-wheel group relative grid h-11 w-[5.25rem] touch-none place-items-center overflow-hidden rounded-full"
      aria-label={`${monthLabel(month)}. Desliza para cambiar de mes; activa para volver al mes actual.`}
      onClick={onToday}
      onWheel={(event) => {
        event.preventDefault();
        if (wheelLock.current || Math.abs(event.deltaY) < 8) return;
        wheelLock.current = true;
        onStep(event.deltaY > 0 ? 1 : -1);
        window.setTimeout(() => { wheelLock.current = false; }, 360);
      }}
      onPointerDown={(event) => {
        dragStart.current = event.clientY;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        if (dragStart.current === null) return;
        const distance = event.clientY - dragStart.current;
        dragStart.current = null;
        if (Math.abs(distance) > 22) {
          event.preventDefault();
          onStep(distance > 0 ? -1 : 1);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); onStep(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); onStep(1); }
      }}
    >
      <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-[var(--border-light)]" />
      <motion.span key={keyForMonth(month)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative bg-[var(--surface-canvas)] px-2 text-[9px] font-medium uppercase tracking-[0.24em] text-text-secondary">{label}</motion.span>
      <span className="absolute left-1/2 top-1 h-2 w-px -translate-x-1/2 bg-memory-electric/70 transition-all group-hover:h-3" />
      <span className="absolute bottom-1 left-1/2 h-2 w-px -translate-x-1/2 bg-memory-electric/35 transition-all group-hover:h-3" />
    </button>
  );
}

export function DreamCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const { dreams, isReady, persistence, removeDream, restoreDream, resetDreams, cloud, publishDream, makeDreamPrivate } = useDreamStore();
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<Toast>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [previewDate, setPreviewDate] = React.useState<string | null>(null);
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
  const monthDreams = Array.from(dreamMap.values()).flat();
  const previewDreams = previewDate ? dreamMap.get(previewDate) ?? [] : monthDreams;

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
    router.replace(`/calendar?month=${monthKeyForDate(dream.date)}`, { scroll: false });
    window.setTimeout(() => setHighlightedId(null), 1800);
  }

  function handleDelete(dream: Dream) {
    const removed = removeDream(dream.id);
    if (!removed) return;
    setToast({ dream: removed, kind: "deleted" });
    closeFocus();
  }

  const isCalendarEmpty = isReady && dreams.length === 0;
  return (
    <LayoutGroup id="calendar-memory">
      <div className="relative pb-28">
        <motion.div animate={selectedDream || selectedCollection.length > 1 ? "receded" : "rest"} initial="rest" variants={calendarVariants} className="z-calendar">
          <div className="mx-auto max-w-[1160px]">
            <header className="mb-8 flex flex-col gap-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <h1 className="type-ethereal font-display text-balance leading-none text-text-primary">
                  <span className="block capitalize text-[clamp(4.8rem,10vw,9.8rem)] tracking-[-0.055em]">{monthName(currentMonth)}</span>
                  <span className="mt-1 block text-[clamp(1rem,2.2vw,1.7rem)] font-normal tracking-[0.34em] text-text-muted">de {currentMonth.getFullYear()}</span>
                </h1>
                {persistence.kind === "warning" && persistence.message ? <p role="status" aria-live="polite" className="mt-3 text-xs leading-5 text-memory-accessible">{persistence.message}</p> : null}
              </div>
              <div className="flex w-fit items-center gap-1 rounded-full border border-[var(--border-quiet)] bg-[color-mix(in_srgb,var(--surface-canvas)_68%,transparent)] p-1" aria-label="Navegar meses">
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-text-muted transition-colors hover:text-memory-electric" aria-label="Mes anterior" onClick={() => moveMonth(-1)}><ChevronLeft className="h-4 w-4" /></button>
                <MonthWheel month={currentMonth} onStep={moveMonth} onToday={() => updateUrl({ month: keyForMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), dream: null, collection: null, compose: null })} />
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-text-muted transition-colors hover:text-memory-electric" aria-label="Mes siguiente" onClick={() => moveMonth(1)}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </header>

            <section aria-label={`Calendario de ${monthLabel(currentMonth)}`} className="relative mx-auto aspect-square w-full max-w-[680px] sm:-mt-28">
              <div aria-hidden="true" className="absolute inset-[5%] rounded-full border border-[var(--calendar-line)]" />
              <div aria-hidden="true" className="absolute inset-[15%] rounded-full border border-[var(--border-quiet)] opacity-65" />
              <div aria-hidden="true" className="absolute left-1/2 top-[3%] h-[10%] w-px -translate-x-1/2 bg-gradient-to-b from-memory-electric/70 to-transparent" />
              <ol className="absolute inset-0 m-0 list-none p-0">
                {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => {
                  const date = dateForDay(currentMonth, day);
                  const dayDreams = dreamMap.get(date) ?? [];
                  const hasDreams = dayDreams.length > 0;
                  const isToday = date === todayIso();
                  const angle = ((day - 1) / dayCount) * Math.PI * 2 - Math.PI / 2;
                  const left = 50 + Math.cos(angle) * 45;
                  const top = 50 + Math.sin(angle) * 45;
                  return (
                    <li key={date} className={cn("orbit-day pointer-events-none absolute", hasDreams && "z-calendar")} style={{ left: `${left}%`, top: `${top}%` }}>
                      <button
                        id={dayDreams.length === 1 ? `dream-pearl-${dayDreams[0].id}` : undefined}
                        type="button"
                        className={cn("pointer-events-auto group relative grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[9px] font-medium transition-transform sm:h-11 sm:w-11 sm:text-[11px]", hasDreams ? "text-text-primary hover:scale-110" : "text-text-muted hover:text-text-primary", isToday && "after:absolute after:-bottom-0.5 after:h-px after:w-4 after:bg-memory-electric")}
                        aria-label={hasDreams ? dayDreams.length === 1 ? `Abrir sueño: ${dayDreams[0].title}, ${formatDreamDate(date)}` : `Abrir ${dayDreams.length} sueños del ${formatDreamDate(date)}` : `${formatDreamDate(date)}, sin sueños`}
                        onPointerEnter={() => setPreviewDate(date)}
                        onPointerLeave={() => setPreviewDate(null)}
                        onFocus={() => setPreviewDate(date)}
                        onBlur={() => setPreviewDate(null)}
                        onClick={() => {
                          setPreviewDate(date);
                          if (dayDreams.length === 1) updateUrl({ dream: dayDreams[0].id, compose: null });
                          if (dayDreams.length > 1) updateUrl({ collection: date, dream: null, compose: null });
                        }}
                      >
                        <span className="relative z-10">{day}</span>
                        {hasDreams ? <span className="absolute left-1/2 top-[62%] -translate-x-1/2 scale-[.46] sm:top-[68%] sm:scale-[.58]"><DreamPearl dream={dayDreams[0]} size="md" multiple={dayDreams.length > 1} interactive /></span> : null}
                        {hasDreams ? <span className="orbit-tooltip pointer-events-none absolute left-1/2 top-[calc(100%+0.55rem)] z-feedback w-36 -translate-x-1/2 rounded-full bg-[var(--surface-canvas)] px-3 py-2 text-center text-[9px] leading-4 tracking-[0.06em] text-text-secondary shadow-soft"><span className="text-memory-accessible">Tú</span> · {dayDreams[0].title}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <motion.div layout className="absolute inset-[23%] grid place-items-center rounded-full bg-[radial-gradient(circle_at_40%_34%,rgba(255,255,255,.66),rgba(255,255,255,.18)_46%,transparent_72%)] p-[8%] text-center backdrop-blur-[2px]">
                <AnimatePresence mode="wait">
                  <motion.div key={previewDate ?? "month"} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(5px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: "blur(4px)" }} transition={reducedMotion ? reducedTransition : transitions.expressive} className="w-full">
                    {previewDate ? <p className="mb-3 text-[8px] uppercase tracking-[0.22em] text-text-muted sm:text-[10px]">{formatDreamDate(previewDate)}</p> : null}
                    {previewDreams.length ? (
                      <div>
                        {!previewDate ? <p className="mb-3 text-[8px] uppercase tracking-[0.22em] text-text-muted sm:text-[10px]">{monthDreams.length} sueño{monthDreams.length === 1 ? "" : "s"}</p> : null}
                        <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-1.5 sm:gap-3">
                          {previewDreams.slice(0, 7).map((dream) => (
                            <button key={dream.id} type="button" className="group grid min-h-12 min-w-12 place-items-center rounded-full" aria-label={`Ver sueño en el centro: ${dream.title}`} onClick={() => updateUrl({ dream: dream.id, compose: null })}>
                              <DreamPearl dream={dream} size="lg" interactive selected={highlightedId === dream.id} layoutId={`pearl-${dream.id}`} />
                              <span className="mt-2 hidden max-w-24 text-[9px] leading-3 tracking-[0.04em] text-text-secondary sm:block">{dream.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-display text-[clamp(1.2rem,3vw,2.5rem)] leading-tight tracking-[-0.025em]">{isCalendarEmpty ? "No hay sueños todavía." : previewDate ? "Sin registro" : "Sin registros este mes."}</p>
                        <p className="mx-auto mt-3 max-w-56 text-[9px] leading-4 tracking-[0.05em] text-text-muted sm:text-[11px]">{isCalendarEmpty ? "Registra el primero cuando quieras." : "Desliza el mes o elige otra fecha."}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </section>

            <footer className="mt-8 flex flex-col gap-3 border-t border-[var(--border-quiet)] pt-4 text-[10px] leading-4 text-text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>{cloud.status === "synced" ? "Sincronizado de forma privada con tu cuenta." : "Este dispositivo guarda tus sueños localmente."}</p>
              {confirmReset ? (
                <span className="flex flex-wrap items-center gap-2 text-text-secondary">
                  <span>¿Borrar todos los sueños locales?</span>
                  <Button size="sm" variant="secondary" onClick={() => { resetDreams(); setConfirmReset(false); }}>Sí, borrar datos</Button>
                  <button type="button" className="min-h-9 px-2 text-xs underline-offset-4 hover:underline" onClick={() => setConfirmReset(false)}>Cancelar</button>
                </span>
              ) : <button type="button" className="inline-flex min-h-10 items-center gap-2 self-start text-[10px] underline-offset-4 hover:underline sm:self-auto" onClick={() => setConfirmReset(true)}><RotateCcw className="h-3 w-3" />Borrar datos locales</button>}
            </footer>
          </div>
        </motion.div>

        {!selectedDream && selectedCollection.length < 2 && !composeMode ? <div className="fixed bottom-5 right-4 z-surface sm:bottom-7 sm:right-7 lg:right-10"><CloudCurtain onOpen={() => openComposer()} emphasized={isCalendarEmpty} /></div> : null}

        <AnimatePresence>
          {selectedDream && !composeMode ? <DreamFocus key={selectedDream.id} dream={selectedDream} onBack={closeFocus} onEdit={() => updateUrl({ compose: "edit" })} onDelete={() => handleDelete(selectedDream)} canShare={cloud.status === "synced"} publicName={cloud.publicName} onPublish={(publicName) => publishDream(selectedDream.id, publicName)} onMakePrivate={() => void makeDreamPrivate(selectedDream.id)} /> : null}
          {selectedCollection.length > 1 && !selectedDream && !composeMode ? <DreamCollection key={selectedCollectionDate} date={selectedCollectionDate!} dreams={selectedCollection} onBack={() => updateUrl({ collection: null })} onSelect={(dream) => updateUrl({ collection: null, dream: dream.id })} /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {composeMode ? <DreamComposer key={`${composeMode}-${selectedDream?.id ?? "new"}`} mode={composeMode} dream={composeMode === "edit" ? selectedDream : undefined} initialDate={composeMode === "edit" && selectedDream ? selectedDream.date : composerDate} onClose={closeComposer} onSaved={handleSaved} /> : null}
        </AnimatePresence>
        <AnimatePresence>
          {toast ? (
            <motion.div role="status" aria-live="polite" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reducedMotion ? reducedTransition : transitions.standard} className="material-frost fixed bottom-5 left-4 z-feedback max-w-[min(27rem,calc(100vw-2rem))] rounded-[20px] p-4 sm:bottom-7 sm:left-7">
              <p className="text-sm leading-6 text-text-secondary">{toast.kind === "saved" ? "Registro guardado." : "Registro eliminado."}</p>
              {toast.kind === "deleted" ? <button type="button" className="mt-2 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-text-primary underline-offset-4 hover:underline" onClick={() => { restoreDream(toast.dream); setToast(null); }}><ArrowLeft className="h-3.5 w-3.5" />Deshacer</button> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
