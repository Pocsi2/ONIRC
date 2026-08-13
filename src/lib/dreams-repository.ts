import type { Dream } from "@/lib/dreams";
import { dreams as seedDreams } from "@/lib/dreams";
import { parsePersistedDreams, serializeDreams } from "@/lib/dreams-schema";

const STORAGE_KEY = "oneiric:dreams:v2";
const LEGACY_STORAGE_KEY = "oneiric:dreams:v1";

export type PersistenceMode = "browser" | "memory";

export type PersistenceStatus = {
  mode: PersistenceMode;
  message?: string;
};

export interface DreamRepository {
  load(): Dream[];
  save(dreams: Dream[]): void;
  subscribe(listener: () => void): () => void;
  status(): PersistenceStatus;
}

class LocalDreamRepository implements DreamRepository {
  private currentDreams = seedDreams;
  private loaded = false;
  private currentStatus: PersistenceStatus = { mode: "memory" };
  private listeners = new Set<() => void>();

  load() {
    if (this.loaded) return this.currentDreams;
    this.loaded = true;

    if (typeof window === "undefined" || !window.localStorage) {
      this.currentStatus = {
        mode: "memory",
        message: "Memories will remain in this session on this browser.",
      };
      return this.currentDreams;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) {
        this.currentStatus = { mode: "browser" };
        return this.currentDreams;
      }

      const parsed = parsePersistedDreams(JSON.parse(stored));
      if (!parsed) {
        this.currentStatus = {
          mode: "browser",
          message: "The saved memory format was not recognized, so the seed landscape was restored.",
        };
        return this.currentDreams;
      }

      this.currentDreams = parsed.dreams;
      this.currentStatus = {
        mode: "browser",
        message: parsed.migrated ? "Your memories were gently updated to the current format." : undefined,
      };

      if (parsed.migrated) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDreams(this.currentDreams)));
      }
    } catch {
      this.currentStatus = {
        mode: "memory",
        message: "Browser storage is unavailable. Your memories will remain for this session.",
      };
    }

    return this.currentDreams;
  }

  save(nextDreams: Dream[]) {
    this.currentDreams = nextDreams;
    this.loaded = true;

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDreams(nextDreams)));
        this.currentStatus = { mode: "browser" };
      } catch {
        this.currentStatus = {
          mode: "memory",
          message: "Browser storage is full or unavailable. Your memories remain for this session.",
        };
      }
    }

    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    if (typeof window !== "undefined") {
      const handleStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
        this.loaded = false;
        this.load();
        listener();
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        this.listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    }
    return () => this.listeners.delete(listener);
  }

  status() {
    return this.currentStatus;
  }
}

export const dreamRepository: DreamRepository = new LocalDreamRepository();
