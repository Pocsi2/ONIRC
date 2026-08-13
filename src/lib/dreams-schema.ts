import type { Dream } from "@/lib/dreams";

export const DREAM_STORAGE_VERSION = 2;

export type PersistedDreams = {
  version: typeof DREAM_STORAGE_VERSION;
  dreams: Dream[];
};

const hues = new Set<Dream["hue"]>(["cyan", "lavender", "blush", "mint", "champagne"]);

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function isDreamRecord(value: unknown): value is Dream {
  if (!value || typeof value !== "object") return false;
  const dream = value as Partial<Dream>;
  return (
    typeof dream.id === "string" &&
    dream.id.length > 0 &&
    isDate(dream.date) &&
    typeof dream.title === "string" &&
    dream.title.length > 0 &&
    typeof dream.summary === "string" &&
    typeof dream.body === "string" &&
    dream.body.length > 0 &&
    typeof dream.feeling === "string" &&
    typeof dream.place === "string" &&
    typeof dream.hue === "string" &&
    hues.has(dream.hue as Dream["hue"])
  );
}

export function parsePersistedDreams(value: unknown): {
  dreams: Dream[];
  migrated: boolean;
} | null {
  if (Array.isArray(value)) {
    const validDreams = value.filter(isDreamRecord);
    return validDreams.length === value.length ? { dreams: validDreams, migrated: true } : null;
  }

  if (!value || typeof value !== "object") return null;
  const envelope = value as Partial<PersistedDreams>;
  if (envelope.version !== DREAM_STORAGE_VERSION || !Array.isArray(envelope.dreams)) return null;

  const validDreams = envelope.dreams.filter(isDreamRecord);
  return validDreams.length === envelope.dreams.length
    ? { dreams: validDreams, migrated: false }
    : null;
}

export function serializeDreams(dreams: Dream[]): PersistedDreams {
  return { version: DREAM_STORAGE_VERSION, dreams };
}
