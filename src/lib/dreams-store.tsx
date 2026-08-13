"use client";

import * as React from "react";
import type { Dream } from "@/lib/dreams";
import { dreams } from "@/lib/dreams";

const STORAGE_KEY = "oneiric:dreams:v1";
const dreamListeners = new Set<() => void>();
let clientDreams: Dream[] = dreams;
let hasReadStorage = false;

export type DreamDraft = Pick<Dream, "date" | "title" | "body"> &
  Partial<Pick<Dream, "feeling" | "place" | "hue">>;

type DreamStoreValue = {
  dreams: Dream[];
  isReady: boolean;
  addDream: (draft: DreamDraft) => Dream;
  updateDream: (id: string, draft: DreamDraft) => Dream | undefined;
  removeDream: (id: string) => void;
  getDream: (id: string) => Dream | undefined;
};

const DreamStoreContext = React.createContext<DreamStoreValue | null>(null);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
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
  const base = slugify(title) || "untitled-dream";
  return `${base}-${Date.now().toString(36)}`;
}

function readStoredDreams() {
  try {
    const storage = window.localStorage;
    if (!storage) return dreams;
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return dreams;

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return dreams;

    return parsed.filter((dream): dream is Dream => {
      if (!dream || typeof dream !== "object") return false;
      const candidate = dream as Partial<Dream>;
      return Boolean(candidate.id && candidate.date && candidate.title && candidate.body);
    });
  } catch {
    return dreams;
  }
}

function getClientDreams() {
  if (typeof window !== "undefined" && !hasReadStorage) {
    clientDreams = readStoredDreams();
    hasReadStorage = true;
  }
  return clientDreams;
}

function subscribeToDreams(listener: () => void) {
  dreamListeners.add(listener);
  if (typeof window !== "undefined") {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      clientDreams = readStoredDreams();
      listener();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      dreamListeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  }
  return () => dreamListeners.delete(listener);
}

function writeDreams(nextDreams: Dream[]) {
  clientDreams = nextDreams;
  hasReadStorage = true;
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(nextDreams));
  } catch {
    // The in-memory store remains usable when browser storage is unavailable.
  }
  dreamListeners.forEach((listener) => listener());
}

export function DreamStoreProvider({ children }: { children: React.ReactNode }) {
  const dreamList = React.useSyncExternalStore(subscribeToDreams, getClientDreams, () => dreams);
  const isReady = React.useSyncExternalStore(() => () => undefined, () => true, () => false);

  const addDream = React.useCallback((draft: DreamDraft) => {
    const dream = dreamFromDraft(draft, idForDream(draft.title));
    writeDreams([...getClientDreams(), dream]);
    return dream;
  }, []);

  const updateDream = React.useCallback((id: string, draft: DreamDraft) => {
    const existing = dreamList.find((dream) => dream.id === id);
    if (!existing) return undefined;

    const updated = dreamFromDraft(draft, id);
    writeDreams(getClientDreams().map((dream) => (dream.id === id ? updated : dream)));
    return updated;
  }, [dreamList]);

  const removeDream = React.useCallback((id: string) => {
    writeDreams(getClientDreams().filter((dream) => dream.id !== id));
  }, []);

  const getDream = React.useCallback(
    (id: string) => dreamList.find((dream) => dream.id === id),
    [dreamList],
  );

  const value = React.useMemo(
    () => ({ dreams: dreamList, isReady, addDream, updateDream, removeDream, getDream }),
    [addDream, dreamList, getDream, isReady, removeDream, updateDream],
  );

  return <DreamStoreContext.Provider value={value}>{children}</DreamStoreContext.Provider>;
}

export function useDreamStore() {
  const context = React.useContext(DreamStoreContext);
  if (!context) {
    throw new Error("useDreamStore must be used inside DreamStoreProvider");
  }
  return context;
}
