"use client";

import * as React from "react";
import type { Dream } from "@/lib/dreams";
import { dreams } from "@/lib/dreams";
import { dreamRepository, type PersistenceStatus } from "@/lib/dreams-repository";

export type DreamDraft = Pick<Dream, "date" | "title" | "body"> &
  Partial<Pick<Dream, "feeling" | "place" | "hue">>;

type DreamStoreValue = {
  dreams: Dream[];
  isReady: boolean;
  persistence: PersistenceStatus;
  addDream: (draft: DreamDraft) => Dream;
  updateDream: (id: string, draft: DreamDraft) => Dream | undefined;
  removeDream: (id: string) => void;
  getDream: (id: string) => Dream | undefined;
};

const DreamStoreContext = React.createContext<DreamStoreValue | null>(null);

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 42);
}

function summaryFor(body: string) {
  const summary = body.trim().replace(/\s+/g, " ");
  return summary.length > 110 ? `${summary.slice(0, 107)}...` : summary;
}

function dreamFromDraft(draft: DreamDraft, id: string): Dream {
  return {
    id,
    date: draft.date,
    title: draft.title.trim(),
    summary: summaryFor(draft.body),
    body: draft.body.trim(),
    feeling: draft.feeling?.trim() || "newly kept",
    place: draft.place?.trim() || "a place remembered",
    hue: draft.hue ?? "champagne",
  };
}

function idForDream(title: string) {
  return `${slugify(title) || "untitled-dream"}-${Date.now().toString(36)}`;
}

function getDreamSnapshot() {
  return typeof window === "undefined" ? dreams : dreamRepository.load();
}

function getReadySnapshot() {
  return typeof window !== "undefined";
}

const subscribeDreams = dreamRepository.subscribe.bind(dreamRepository);

export function DreamStoreProvider({ children }: { children: React.ReactNode }) {
  const dreamList = React.useSyncExternalStore(subscribeDreams, getDreamSnapshot, () => dreams);
  const isReady = React.useSyncExternalStore(() => () => undefined, getReadySnapshot, () => false);
  const persistence = dreamRepository.status();

  const addDream = React.useCallback((draft: DreamDraft) => {
    const dream = dreamFromDraft(draft, idForDream(draft.title));
    dreamRepository.save([...dreamRepository.load(), dream]);
    return dream;
  }, []);

  const updateDream = React.useCallback((id: string, draft: DreamDraft) => {
    const currentDreams = dreamRepository.load();
    if (!currentDreams.some((dream) => dream.id === id)) return undefined;
    const updated = dreamFromDraft(draft, id);
    dreamRepository.save(currentDreams.map((dream) => (dream.id === id ? updated : dream)));
    return updated;
  }, []);

  const removeDream = React.useCallback((id: string) => {
    dreamRepository.save(dreamRepository.load().filter((dream) => dream.id !== id));
  }, []);

  const getDream = React.useCallback((id: string) => dreamList.find((dream) => dream.id === id), [dreamList]);

  const value = React.useMemo(
    () => ({ dreams: dreamList, isReady, persistence, addDream, updateDream, removeDream, getDream }),
    [addDream, dreamList, getDream, isReady, persistence, removeDream, updateDream],
  );

  return <DreamStoreContext.Provider value={value}>{children}</DreamStoreContext.Provider>;
}

export function useDreamStore() {
  const context = React.useContext(DreamStoreContext);
  if (!context) throw new Error("useDreamStore must be used inside DreamStoreProvider");
  return context;
}
