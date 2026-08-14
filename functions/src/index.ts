import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, type DocumentData } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();
const functionOptions = { region: "us-central1", maxInstances: 2 } as const;
const VALID_HUES = new Set(["cyan", "lavender", "blush", "mint", "champagne"]);
const VALID_REPORT_REASONS = new Set(["personal", "abuse", "other"]);

type PublicProjection = {
  id: string;
  visibility: "visible";
  schemaVersion: 1;
  date: string;
  title: string;
  body: string;
  hue: string;
  authorName: string;
  publishedAt: string;
};

function requireUser(auth: { uid: string; token: Record<string, unknown> } | undefined) {
  if (!auth) throw new HttpsError("unauthenticated", "Necesitas una cuenta para continuar.");
  return auth;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpsError("invalid-argument", "La solicitud no tiene un formato válido.");
  return value as Record<string, unknown>;
}

function readDreamId(value: Record<string, unknown>) {
  const dreamId = value.dreamId;
  if (typeof dreamId !== "string" || !/^[a-z0-9-]{3,160}$/i.test(dreamId)) throw new HttpsError("invalid-argument", "No encontramos esa memoria.");
  return dreamId;
}

function readAuthorName(value: Record<string, unknown>) {
  const authorName = value.authorName;
  if (typeof authorName !== "string") throw new HttpsError("invalid-argument", "Elige una firma pública válida.");
  const clean = authorName.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 32) throw new HttpsError("invalid-argument", "La firma pública debe tener entre 2 y 32 caracteres.");
  return clean;
}

function projectDream(id: string, source: DocumentData, authorName: string, publishedAt: string): PublicProjection {
  const { date, title, body, hue } = source;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpsError("failed-precondition", "La fecha de esta memoria no es válida.");
  if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 120) throw new HttpsError("failed-precondition", "El título de esta memoria no es válido.");
  if (typeof body !== "string" || body.trim().length < 8 || body.trim().length > 12000) throw new HttpsError("failed-precondition", "La narrativa de esta memoria no es válida.");
  if (typeof hue !== "string" || !VALID_HUES.has(hue)) throw new HttpsError("failed-precondition", "El tono de esta memoria no es válido.");

  return { id, visibility: "visible", schemaVersion: 1, date, title: title.trim(), body: body.trim(), hue, authorName, publishedAt };
}

function isAdmin(token: Record<string, unknown>) {
  return token.admin === true;
}

export const publishDream = onCall(functionOptions, async (request) => {
  const auth = requireUser(request.auth);
  const input = asRecord(request.data);
  const dreamId = readDreamId(input);
  const authorName = readAuthorName(input);
  const sourceRef = db.doc(`users/${auth.uid}/dreams/${dreamId}`);
  const linkRef = db.doc(`users/${auth.uid}/publicationLinks/${dreamId}`);
  const publicRef = db.collection("publicDreams").doc();
  const now = new Date().toISOString();

  await db.runTransaction(async (transaction) => {
    const [sourceSnapshot, linkSnapshot] = await Promise.all([transaction.get(sourceRef), transaction.get(linkRef)]);
    if (!sourceSnapshot.exists) throw new HttpsError("not-found", "No encontramos esa memoria privada.");
    if (linkSnapshot.exists) throw new HttpsError("already-exists", "Esta memoria ya tiene una copia pública.");
    const source = sourceSnapshot.data();
    if (!source) throw new HttpsError("not-found", "No encontramos esa memoria privada.");
    transaction.set(publicRef, projectDream(publicRef.id, source, authorName, now));
    transaction.set(linkRef, { publicId: publicRef.id, dreamId, authorName, publishedAt: now, schemaVersion: 1 });
    transaction.set(db.doc(`users/${auth.uid}`), { publicName: authorName, updatedAt: now }, { merge: true });
    transaction.update(sourceRef, { visibility: "public", updatedAt: now });
  });

  return { publicId: publicRef.id };
});

export const unpublishDream = onCall(functionOptions, async (request) => {
  const auth = requireUser(request.auth);
  const dreamId = readDreamId(asRecord(request.data));
  const sourceRef = db.doc(`users/${auth.uid}/dreams/${dreamId}`);
  const linkRef = db.doc(`users/${auth.uid}/publicationLinks/${dreamId}`);

  const publicId = await db.runTransaction(async (transaction) => {
    const [linkSnapshot, sourceSnapshot] = await Promise.all([transaction.get(linkRef), transaction.get(sourceRef)]);
    if (!linkSnapshot.exists) throw new HttpsError("not-found", "No encontramos una copia pública para esta memoria.");
    const link = linkSnapshot.data();
    const value = link?.publicId;
    if (typeof value !== "string" || !value) throw new HttpsError("failed-precondition", "La referencia pública no es válida.");
    transaction.delete(db.doc(`publicDreams/${value}`));
    transaction.delete(linkRef);
    // Do not recreate a memory that was deleted by an administrative cleanup.
    if (sourceSnapshot.exists) transaction.update(sourceRef, { visibility: "private", updatedAt: new Date().toISOString() });
    return value;
  });

  return { publicId };
});

export const reportPublicDream = onCall(functionOptions, async (request) => {
  const auth = requireUser(request.auth);
  const input = asRecord(request.data);
  const publicId = input.publicId;
  const reason = input.reason;
  if (typeof publicId !== "string" || !/^[A-Za-z0-9_-]{8,160}$/.test(publicId)) throw new HttpsError("invalid-argument", "No encontramos esa publicación.");
  if (typeof reason !== "string" || !VALID_REPORT_REASONS.has(reason)) throw new HttpsError("invalid-argument", "Elige un motivo de reporte válido.");
  const dream = await db.doc(`publicDreams/${publicId}`).get();
  if (!dream.exists || dream.data()?.visibility !== "visible") throw new HttpsError("not-found", "Esta publicación ya no está disponible.");
  const report = await db.collection("moderationReports").add({ publicId, reporterId: auth.uid, reason, status: "pending", createdAt: FieldValue.serverTimestamp() });
  return { reportId: report.id };
});

/** A console-admin-only escape hatch for the first legacy migration. */
export const migrateLegacyPublicDreams = onCall(functionOptions, async (request) => {
  const auth = requireUser(request.auth);
  if (!isAdmin(auth.token)) throw new HttpsError("permission-denied", "Esta migración requiere permisos de administración.");
  // Three writes are possible per legacy document, so keep well below Firestore's
  // 500-operation batch ceiling. Source data is always re-read from the private
  // document: an old public projection is never trusted as the memory itself.
  const legacy = await db.collection("publicDreams").where("ownerId", ">", "").limit(100).get();
  const batch = db.batch();
  let migrated = 0;
  let removedOrphans = 0;

  for (const legacyDoc of legacy.docs) {
    const data = legacyDoc.data();
    const ownerId = data.ownerId;
    const sourceDreamId = data.sourceDreamId;
    if (typeof ownerId !== "string" || typeof sourceDreamId !== "string") continue;
    const sourceRef = db.doc(`users/${ownerId}/dreams/${sourceDreamId}`);
    const linkRef = db.doc(`users/${ownerId}/publicationLinks/${sourceDreamId}`);
    const [sourceSnapshot, linkSnapshot] = await Promise.all([sourceRef.get(), linkRef.get()]);
    if (!sourceSnapshot.exists) {
      // Deleted private memories must never be resurrected from an unsafe copy.
      batch.delete(legacyDoc.ref);
      removedOrphans += 1;
      continue;
    }
    if (linkSnapshot.exists) {
      // A prior safe migration already owns the canonical projection.
      batch.delete(legacyDoc.ref);
      removedOrphans += 1;
      continue;
    }
    const source = sourceSnapshot.data();
    if (!source) {
      batch.delete(legacyDoc.ref);
      removedOrphans += 1;
      continue;
    }
    const newRef = db.collection("publicDreams").doc();
    const publishedAt = typeof data.publishedAt === "string" ? data.publishedAt : new Date().toISOString();
    const authorName = typeof data.authorName === "string" && data.authorName.trim().length >= 2 ? data.authorName.trim().slice(0, 32) : "Archivo Onirc";
    batch.set(newRef, projectDream(newRef.id, source, authorName, publishedAt));
    batch.set(linkRef, { publicId: newRef.id, dreamId: sourceDreamId, authorName, publishedAt, schemaVersion: 1 });
    batch.set(sourceRef, { visibility: "public", updatedAt: new Date().toISOString() }, { merge: true });
    batch.delete(legacyDoc.ref);
    migrated += 1;
  }

  if (migrated || removedOrphans) await batch.commit();
  return { migrated, removedOrphans, remainingScanRequired: legacy.size === 100 };
});
