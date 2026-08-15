"use client";

import { isPublicArchiveAvailable, publicArchiveApiUrl, publicArchiveState } from "@/lib/archive-state";
import { DREAM_HUES, type DreamHue } from "@/lib/dreams";
import { getFirebaseAuth } from "@/lib/firebase";

export { isPublicArchiveAvailable, publicArchiveApiUrl, publicArchiveState };

type ArchiveErrorBody = { message?: unknown };
const archiveHueSet = new Set<string>(DREAM_HUES);

/** The browser accepts only the same narrow projection returned by the Worker. */
export type PublicDream = {
  id: string;
  visibility: "visible";
  schemaVersion: 2;
  date: string;
  title: string;
  body: string;
  hue: DreamHue;
  authorName: string;
  publishedAt: string;
};

function endpoint(path: string) {
  if (!publicArchiveApiUrl) throw new Error("El archivo público está en preparación.");
  return new URL(`v1/archive/${path}`, `${publicArchiveApiUrl}/`).toString();
}

async function readArchiveResponse<Result>(response: Response) {
  const payload = await response.json().catch(() => null) as Result | ArchiveErrorBody | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : "No pudimos preservar esta memoria ahora.";
    throw new Error(message);
  }
  return payload as Result;
}

async function requestArchive<Result>(path: string, body: Record<string, unknown>) {
  if (!isPublicArchiveAvailable) throw new Error("El archivo público está en preparación.");
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Necesitas una cuenta para continuar.");
  const token = await user.getIdToken();
  const response = await fetch(endpoint(path), {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return readArchiveResponse<Result>(response);
}

function isPublicDream(value: unknown): value is PublicDream {
  if (!value || typeof value !== "object") return false;
  const dream = value as Partial<PublicDream>;
  return typeof dream.id === "string"
    && dream.visibility === "visible"
    && dream.schemaVersion === 2
    && typeof dream.date === "string"
    && typeof dream.title === "string"
    && typeof dream.body === "string"
    && typeof dream.hue === "string"
    && archiveHueSet.has(dream.hue)
    && typeof dream.authorName === "string"
    && typeof dream.publishedAt === "string";
}

export async function loadPublicDreamsFromArchive() {
  if (!isPublicArchiveAvailable) throw new Error("El archivo público está en preparación.");
  const response = await fetch(endpoint("feed"), { cache: "default" });
  const payload = await readArchiveResponse<{ dreams?: unknown }>(response);
  return Array.isArray(payload?.dreams) ? payload.dreams.filter(isPublicDream) : [];
}

export async function publishDreamThroughArchive(dreamId: string, authorName: string) {
  return requestArchive<{ publicId: string }>("publish", { dreamId, authorName });
}

export async function unpublishDreamThroughArchive(dreamId: string) {
  return requestArchive<{ publicId: string }>("unpublish", { dreamId });
}

export async function reportPublicDream(publicId: string, reason: "personal" | "abuse" | "other") {
  return requestArchive<{ reportId: string }>("report", { publicId, reason });
}
