"use client";

import * as React from "react";
import { hueForId, slugifyDream, type Dream, type DreamDraft, type SavedDraft } from "@/lib/dreams";
import { clearAllLocalDreams, clearDraft, loadDraft, loadDreams, saveDraft, saveDreams, type PersistenceStatus } from "@/lib/dreams-repository";
import { normalizeDraft } from "@/lib/dreams-schema";

type LocalDreamState = {
  dreams: Dream[];
  isReady: boolean;
  persistence: PersistenceStatus;
  savedDraft: SavedDraft | null;
};

type DreamStoreValue = LocalDreamState & {
  addDream: (draft: DreamDraft) => Dream;
  updateDream: (id: string, draft: DreamDraft) => Dream | undefined;
  removeDream: (id: string) => Dream | undefined;
  restoreDream: (dream: Dream) => void;
  resetDreams: () => void;
  getDream: (id: string) => Dream | undefined;
  saveLocalDraft: (draft: DreamDraft) => void;
  clearLocalDraft: () => void;
};

const emptyState: LocalDreamState = { dreams: [], isReady: false, persistence: { kind: "ready" }, savedDraft: null };
let currentState = emptyState;
let didLoad = false;
const listeners = new Set<() => void>();
const DreamStoreContext = React.createContext<DreamStoreValue | null>(null);

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(next: LocalDreamState) {
  currentState = next;
  notify();
}

function ensureLoaded() {
  if (didLoad || typeof window === "undefined") return;
  didLoad = true;
  const result = loadDreams();
  currentState = { dreams: result.dreams, persistence: result.status, savedDraft: loadDraft(), isReady: true };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  listener();

  function syncFromAnotherTab(event: StorageEvent) {
    if (event.key !== "onirc:dreams:v3") return;
    const result = loadDreams();
    setState({ ...currentState, dreams: result.dreams, persistence: result.status, isReady: true });
  }
  window.addEventListener("storage", syncFromAnotherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncFromAnotherTab);
  };
}

function getClientSnapshot() {
  ensureLoaded();
  return currentState;
}

function idForDream(title: string) {
  return `${slugifyDream(title) || "sueno"}-${Date.now().toString(36)}`;
}

function makeDream(draft: DreamDraft, id: string, createdAt?: string): Dream {
  const clean = normalizeDraft(draft);
  const now = new Date().toISOString();
  return { id, ...clean, hue: hueForId(id), createdAt: createdAt ?? now, updatedAt: now };
}

export function DreamStoreProvider({ children }: { children: React.ReactNode }) {
  const state = React.useSyncExternalStore(subscribe, getClientSnapshot, () => emptyState);

  const addDream = React.useCallback((draft: DreamDraft) => {
    const dream = makeDream(draft, idForDream(draft.title));
    const dreams = [...getClientSnapshot().dreams, dream];
    setState({ ...getClientSnapshot(), dreams, persistence: saveDreams(dreams), isReady: true });
    return dream;
  }, []);

  const updateDream = React.useCallback((id: string, draft: DreamDraft) => {
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current) return undefined;
    const updated = { ...makeDream(draft, id, current.createdAt), hue: current.hue };
    const dreams = snapshot.dreams.map((dream) => (dream.id === id ? updated : dream));
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    return updated;
  }, []);

  const removeDream = React.useCallback((id: string) => {
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current) return undefined;
    const dreams = snapshot.dreams.filter((dream) => dream.id !== id);
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    return current;
  }, []);

  const restoreDream = React.useCallback((dream: Dream) => {
    const snapshot = getClientSnapshot();
    const dreams = snapshot.dreams.some((item) => item.id === dream.id) ? snapshot.dreams : [...snapshot.dreams, dream];
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
  }, []);

  const resetDreams = React.useCallback(() => {
    clearAllLocalDreams();
    setState({ dreams: [], savedDraft: null, isReady: true, persistence: { kind: "ready", message: "El calendario local quedó en blanco." } });
  }, []);

  const saveLocalDraft = React.useCallback((draft: DreamDraft) => {
    const savedDraft = { ...normalizeDraft(draft), updatedAt: new Date().toISOString() };
    saveDraft(savedDraft);
    setState({ ...getClientSnapshot(), savedDraft });
  }, []);

  const clearLocalDraft = React.useCallback(() => {
    clearDraft();
    setState({ ...getClientSnapshot(), savedDraft: null });
  }, []);

  const value = React.useMemo(
    () => ({ ...state, addDream, updateDream, removeDream, restoreDream, resetDreams, getDream: (id: string) => state.dreams.find((dream) => dream.id === id), saveLocalDraft, clearLocalDraft }),
    [addDream, clearLocalDraft, removeDream, resetDreams, restoreDream, saveLocalDraft, state, updateDream],
  );

  return <DreamStoreContext.Provider value={value}>{children}</DreamStoreContext.Provider>;
}

export function useDreamStore() {
  const context = React.useContext(DreamStoreContext);
  if (!context) throw new Error("useDreamStore must be used inside DreamStoreProvider");
  return context;
}
