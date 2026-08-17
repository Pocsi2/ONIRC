import type { Dream, SavedDraft } from "@/lib/dreams";
import { isSavedDraft, parsePersistedDreams, serializeDreams } from "@/lib/dreams-schema";

const STORAGE_KEY = "onirc:dreams:v3";
const DRAFT_KEY = "onirc:draft:v1";
const LEGACY_KEYS = ["oneiric:dreams:v2", "oneiric:dreams:v1"];

export type PersistenceStatus = {
  message?: string;
  kind: "ready" | "warning";
};

export type LoadResult = {
  dreams: Dream[];
  status: PersistenceStatus;
};

function storageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function preserveUnreadableValue(key: string, value: string) {
  try {
    window.localStorage.setItem(`onirc:recovery:${Date.now()}:${key}`, value);
  } catch {
    // Recovery is best effort. The active experience still stays usable.
  }
}

export function loadDreams(): LoadResult {
  if (!storageAvailable()) {
    return { dreams: [], status: { kind: "warning", message: "Este navegador no permite guardar datos de forma duradera." } };
  }

  const keys = [STORAGE_KEY, ...LEGACY_KEYS];
  for (const key of keys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = parsePersistedDreams(JSON.parse(raw));
      if (!parsed) {
        preserveUnreadableValue(key, raw);
        return { dreams: [], status: { kind: "warning", message: "Se detectaron datos no válidos. Se abrió un calendario vacío." } };
      }
      if (parsed.migrated || key !== STORAGE_KEY) saveDreams(parsed.dreams);
      return {
        dreams: parsed.dreams,
        status: parsed.migrated || key !== STORAGE_KEY
          ? { kind: "ready", message: "Los datos locales se actualizaron." }
          : { kind: "ready" },
      };
    } catch {
      preserveUnreadableValue(key, raw);
      return { dreams: [], status: { kind: "warning", message: "Se detectaron datos no válidos. Se abrió un calendario vacío." } };
    }
  }

  return { dreams: [], status: { kind: "ready" } };
}

export function saveDreams(dreams: Dream[]): PersistenceStatus {
  if (!storageAvailable()) return { kind: "warning", message: "No fue posible guardar este cambio fuera de la sesión actual." };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDreams(dreams)));
    return { kind: "ready" };
  } catch {
    return { kind: "warning", message: "Este navegador no pudo guardar más datos localmente." };
  }
}

export function loadDraft(): SavedDraft | null {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return isSavedDraft(draft) ? draft : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: SavedDraft) {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // The visible save action remains the recovery path when draft storage is unavailable.
  }
}

export function clearDraft() {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function clearAllLocalDreams() {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(DRAFT_KEY);
}
