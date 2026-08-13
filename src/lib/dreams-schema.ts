import { DREAM_HUES, hueForId, type Dream, type DreamDraft, type SavedDraft } from "@/lib/dreams";

export const DREAM_STORAGE_VERSION = 3;

export type PersistedDreams = {
  version: typeof DREAM_STORAGE_VERSION;
  dreams: Dream[];
};

const hueSet = new Set<string>(DREAM_HUES);

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

export function isDreamRecord(value: unknown): value is Dream {
  if (!value || typeof value !== "object") return false;
  const dream = value as Partial<Dream>;
  return (
    typeof dream.id === "string" &&
    dream.id.length > 0 &&
    isIsoDate(dream.date) &&
    typeof dream.title === "string" &&
    dream.title.trim().length > 0 &&
    typeof dream.body === "string" &&
    dream.body.trim().length > 0 &&
    typeof dream.hue === "string" &&
    hueSet.has(dream.hue) &&
    (dream.visibility === undefined || dream.visibility === "private" || dream.visibility === "public") &&
    isTimestamp(dream.createdAt) &&
    isTimestamp(dream.updatedAt)
  );
}

function migrateDream(value: unknown): Dream | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Partial<Dream & { summary: string; feeling: string; place: string }>;
  if (
    typeof legacy.id !== "string" ||
    !legacy.id ||
    !isIsoDate(legacy.date) ||
    typeof legacy.title !== "string" ||
    !legacy.title.trim() ||
    typeof legacy.body !== "string" ||
    !legacy.body.trim()
  ) {
    return null;
  }

  const timestamp = new Date(`${legacy.date}T12:00:00Z`).toISOString();
  return {
    id: legacy.id,
    date: legacy.date,
    title: legacy.title.trim(),
    body: legacy.body.trim(),
    hue: typeof legacy.hue === "string" && hueSet.has(legacy.hue) ? legacy.hue as Dream["hue"] : hueForId(legacy.id),
    createdAt: isTimestamp(legacy.createdAt) ? legacy.createdAt : timestamp,
    updatedAt: isTimestamp(legacy.updatedAt) ? legacy.updatedAt : timestamp,
    visibility: legacy.visibility === "public" || legacy.visibility === "private" ? legacy.visibility : undefined,
  };
}

export function parsePersistedDreams(value: unknown): { dreams: Dream[]; migrated: boolean } | null {
  if (Array.isArray(value)) {
    const dreams = value.map(migrateDream);
    return dreams.every(Boolean) ? { dreams: dreams as Dream[], migrated: true } : null;
  }

  if (!value || typeof value !== "object") return null;
  const envelope = value as Partial<PersistedDreams>;
  if (!Array.isArray(envelope.dreams)) return null;

  const dreams = envelope.dreams.map(migrateDream);
  if (!dreams.every(Boolean)) return null;

  return {
    dreams: dreams as Dream[],
    migrated: envelope.version !== DREAM_STORAGE_VERSION || !envelope.dreams.every(isDreamRecord),
  };
}

export function serializeDreams(dreams: Dream[]): PersistedDreams {
  return { version: DREAM_STORAGE_VERSION, dreams };
}

export function isSavedDraft(value: unknown): value is SavedDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<SavedDraft>;
  return isIsoDate(draft.date) && typeof draft.title === "string" && typeof draft.body === "string" && isTimestamp(draft.updatedAt);
}

export function normalizeDraft(value: DreamDraft): DreamDraft {
  return {
    date: value.date,
    title: value.title.slice(0, 120),
    body: value.body.slice(0, 10_000),
  };
}
