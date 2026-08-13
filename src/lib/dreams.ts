export const DREAM_HUES = ["cyan", "lavender", "blush", "mint", "champagne"] as const;

export type DreamHue = (typeof DREAM_HUES)[number];

export type Dream = {
  id: string;
  date: string;
  title: string;
  body: string;
  hue: DreamHue;
  createdAt: string;
  updatedAt: string;
};

export type DreamDraft = Pick<Dream, "date" | "title" | "body">;

export type SavedDraft = DreamDraft & {
  updatedAt: string;
};

const calendarLocale = "es-GT";

export function dateFromIso(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

export function formatDreamDate(date: string) {
  return new Intl.DateTimeFormat(calendarLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateFromIso(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat(calendarLocale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dateFromIso(date));
}

export function monthLabel(date: Date) {
  return new Intl.DateTimeFormat(calendarLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function monthKeyForDate(date: string) {
  return date.slice(0, 7);
}

export function summaryForDream(body: string) {
  const summary = body.trim().replace(/\s+/g, " ");
  return summary.length > 118 ? `${summary.slice(0, 115)}…` : summary;
}

export function hueForId(id: string): DreamHue {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) value = (value * 31 + id.charCodeAt(index)) >>> 0;
  return DREAM_HUES[value % DREAM_HUES.length];
}

export function slugifyDream(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
}
