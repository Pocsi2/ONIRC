"use client";

import * as React from "react";
import { Check, Feather, Moon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { DreamPearl } from "@/components/dream-pearl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ViewTransitionLink } from "@/components/view-transition-link";
import type { Dream } from "@/lib/dreams";
import { visualSavedDream } from "@/lib/dreams";
import { useDreamStore, type DreamDraft } from "@/lib/dreams-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

function previewDream(body: string, date: string, title: string, baseDream?: Dream): Dream {
  return {
    ...(baseDream ?? visualSavedDream),
    date: date || "2026-08-12",
    title: title || "Untitled dream",
    body: body || "The memory will appear here as you write.",
    summary: body.trim().slice(0, 110),
  };
}

export function DreamForm({ mode, dream }: { mode: "create" | "edit"; dream?: Dream }) {
  const reducedMotion = useReducedMotion();
  const { addDream, updateDream } = useDreamStore();
  const [body, setBody] = React.useState(dream?.body ?? "");
  const [date, setDate] = React.useState(dream?.date ?? "2026-08-12");
  const [title, setTitle] = React.useState(dream?.title ?? "");
  const [savedDream, setSavedDream] = React.useState<Dream | null>(null);

  const canKeep = body.trim().length > 8 && Boolean(date) && title.trim().length > 1;
  const preview = previewDream(body, date, title, dream);
  const presenceVariants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } };
  const presenceTransition = reducedMotion ? reducedTransition : transitions.standard;
  const isEditing = mode === "edit";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canKeep) return;

    const draft: DreamDraft = {
      body,
      date,
      title,
      feeling: dream?.feeling,
      place: dream?.place,
      hue: dream?.hue,
    };
    const nextDream = isEditing && dream ? updateDream(dream.id, draft) : addDream(draft);
    if (nextDream) setSavedDream(nextDream);
  }

  return (
    <PageTransition className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <motion.div initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? reducedTransition : transitions.expressive} className="surface-opal z-surface relative overflow-hidden rounded-[48px] p-6 sm:p-10 lg:p-14">
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-white/35 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-text-muted">{isEditing ? "Edit memory" : "New dream"}</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(3.4rem,8vw,7.4rem)] leading-[.88] tracking-[-0.055em]">{isEditing ? "Stay with this one." : "Let's keep one."}</h1>

          <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
            <Reveal delay={0.1}>
              <label className="block">
                <span className="mb-3 block text-sm text-text-secondary">What did you dream?</span>
                <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the fragment before it fades." aria-label="Dream description" required />
              </label>
            </Reveal>

            <AnimatePresence initial={false}>
              {body.trim().length > 8 ? (
                <motion.div {...presenceVariants} transition={presenceTransition} className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 block text-sm text-text-secondary">When did it happen?</span>
                    <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Dream date" required />
                  </label>
                  <label className="block">
                    <span className="mb-3 block text-sm text-text-secondary">Give it a name.</span>
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A title for the memory" aria-label="Dream title" required />
                  </label>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="flex flex-col gap-3 border-t border-white/55 pt-8 sm:flex-row sm:items-center">
              <Button type="submit" disabled={!canKeep}><Feather className="h-4 w-4" />{isEditing ? "Keep the changes" : "Keep this memory"}</Button>
              <Button asChild variant="ghost" type="button"><ViewTransitionLink href={isEditing && dream ? `/dreams/${dream.id}` : "/calendar"}>Leave it for now</ViewTransitionLink></Button>
            </div>
          </form>
        </div>
      </motion.div>

      <motion.aside initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? reducedTransition : { ...transitions.expressive, delay: 0.12 }} className="z-surface lg:sticky lg:top-32 lg:self-start">
        <div className="surface-frost rounded-[42px] p-7">
          <div className="mb-8 flex items-center justify-between"><p className="text-xs uppercase tracking-[0.26em] text-text-muted">Preview</p><Moon className="h-4 w-4 text-text-muted" /></div>
          <div className="relative mx-auto mb-8 grid h-40 w-40 place-items-center"><DreamPearl dream={savedDream ?? preview} size="lg" selected={Boolean(savedDream)} interactive transitionName={savedDream ? `dream-${savedDream.id}` : undefined} /></div>
          <p className="text-sm text-text-muted">{date || "Unplaced in time"}</p>
          <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em]">{title || "Untitled dream"}</h2>
          <p className="mt-5 line-clamp-5 text-sm leading-7 text-text-secondary">{body || "The memory will appear here as you write."}</p>

          <AnimatePresence mode="wait">
            {savedDream ? (
              <motion.div key="saved" {...presenceVariants} transition={presenceTransition} role="status" aria-live="polite" className="mt-8 space-y-4 rounded-[22px] bg-white/55 p-4">
                <div className="flex items-center gap-3 text-sm text-text-secondary"><span className="grid h-8 w-8 place-items-center rounded-full bg-mist-mint/70"><Check className="h-4 w-4 text-text-primary" /></span>{isEditing ? "Changed. The memory remains in its place." : "Kept. It now lives in your temporal landscape."}</div>
                <Button asChild variant="secondary" className="w-full"><ViewTransitionLink href={isEditing ? `/dreams/${savedDream.id}` : `/calendar?kept=${savedDream.id}`}>{isEditing ? "Return to memory" : "See where it lives"}</ViewTransitionLink></Button>
              </motion.div>
            ) : (
              <motion.p key="writing" {...presenceVariants} transition={presenceTransition} className="mt-8 text-sm text-text-muted">Write the fragment first. The pearl will form as you remember.</motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </PageTransition>
  );
}
