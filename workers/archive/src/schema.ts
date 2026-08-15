export const ARCHIVE_HUES = ["cyan", "lavender", "blush", "mint", "champagne"] as const;
const ARCHIVE_HUE_SET = new Set<string>(ARCHIVE_HUES);
const PSEUDONYM_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '’.-]*$/u;
const FORBIDDEN_PUBLIC_FIELDS = new Set([
  "ownerId",
  "sourceDreamId",
  "uid",
  "userId",
  "email",
  "ownerEmail",
  "dreamPath",
  "sourcePath",
]);
const PUBLIC_PROJECTION_FIELDS = new Set([
  "id",
  "visibility",
  "schemaVersion",
  "date",
  "title",
  "body",
  "hue",
  "authorName",
  "publishedAt",
]);

export type ArchiveHue = (typeof ARCHIVE_HUES)[number];

export type PrivateDreamProjectionInput = {
  date: string;
  title: string;
  body: string;
  hue: ArchiveHue;
};

export type SafePublicProjection = PrivateDreamProjectionInput & {
  id: string;
  visibility: "visible";
  schemaVersion: 2;
  authorName: string;
  publishedAt: string;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isTimestamp(value: unknown) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

export function normalizePseudonym(value: unknown) {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length >= 2 && clean.length <= 32 && PSEUDONYM_PATTERN.test(clean) ? clean : null;
}

export function isDreamId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{3,160}$/i.test(value);
}

export function isPublicId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,160}$/.test(value);
}

export function isArchiveReportReason(value: unknown): value is "personal" | "abuse" | "other" {
  return value === "personal" || value === "abuse" || value === "other";
}

export function decodePrivateDream(value: unknown): PrivateDreamProjectionInput | null {
  if (!isPlainRecord(value)) return null;
  const { date, title, body, hue } = value;
  if (typeof date !== "string" || !isIsoDate(date)) return null;
  if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 120) return null;
  if (typeof body !== "string" || body.trim().length < 8 || body.trim().length > 12_000) return null;
  if (typeof hue !== "string" || !ARCHIVE_HUE_SET.has(hue)) return null;
  return { date, title: title.trim(), body: body.trim(), hue: hue as ArchiveHue };
}

export function buildSafeProjection(
  publicId: string,
  source: PrivateDreamProjectionInput,
  authorName: string,
  publishedAt: string,
): SafePublicProjection {
  return {
    id: publicId,
    visibility: "visible",
    schemaVersion: 2,
    date: source.date,
    title: source.title,
    body: source.body,
    hue: source.hue,
    authorName,
    publishedAt,
  };
}

export function hasForbiddenPublicFields(value: unknown) {
  if (!isPlainRecord(value)) return true;
  return Object.keys(value).some((key) => FORBIDDEN_PUBLIC_FIELDS.has(key));
}

/**
 * Only this exact, deliberately small schema may be legible outside a private
 * account. A deny-list alone is not enough: an unknown future field could be
 * an identifier too, so projections are checked against an allow-list.
 */
export function isSafePublicProjection(value: unknown): value is SafePublicProjection {
  if (!isPlainRecord(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== PUBLIC_PROJECTION_FIELDS.size || keys.some((key) => !PUBLIC_PROJECTION_FIELDS.has(key))) return false;
  if (hasForbiddenPublicFields(value)) return false;
  if (value.visibility !== "visible" || value.schemaVersion !== 2 || !isPublicId(value.id)) return false;
  const source = decodePrivateDream(value);
  const authorName = normalizePseudonym(value.authorName);
  return Boolean(source) && authorName === value.authorName && isTimestamp(value.publishedAt);
}
