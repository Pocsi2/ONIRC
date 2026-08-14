"use client";

import { isPublicArchiveAvailable, publicArchiveState } from "@/lib/archive-state";
import { getFirebaseFunctions } from "@/lib/firebase";

export { isPublicArchiveAvailable, publicArchiveState };

async function callable<Request, Response>(name: string) {
  const [{ httpsCallable }, functions] = await Promise.all([import("firebase/functions"), getFirebaseFunctions()]);
  return httpsCallable<Request, Response>(functions, name);
}

export async function publishDreamThroughArchive(dreamId: string, authorName: string) {
  const publishDream = await callable<{ dreamId: string; authorName: string }, { publicId: string }>("publishDream");
  return publishDream({ dreamId, authorName });
}

export async function unpublishDreamThroughArchive(dreamId: string) {
  const unpublishDream = await callable<{ dreamId: string }, { publicId: string }>("unpublishDream");
  return unpublishDream({ dreamId });
}

export async function reportPublicDream(publicId: string, reason: "personal" | "abuse" | "other") {
  const reportDream = await callable<{ publicId: string; reason: "personal" | "abuse" | "other" }, { reportId: string }>("reportPublicDream");
  return reportDream({ publicId, reason });
}
