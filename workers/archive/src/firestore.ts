import { ArchiveError } from "./errors";
import type { FirestoreDocument, FirestoreRead, FirestoreValue, FirestoreWrite, WorkerEnv } from "./types";

type GoogleAccessToken = { value: string; expiresAt: number };
let cachedAccessToken: GoogleAccessToken | null = null;

function toBase64Url(value: Uint8Array) {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeJson(value: unknown) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToBytes(value: string) {
  const base64 = value
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signServiceAssertion(env: WorkerEnv) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "RS256", typ: "JWT" });
  const payload = encodeJson({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3_300,
  });
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${toBase64Url(new Uint8Array(signature))}`;
}

async function getGoogleAccessToken(env: WorkerEnv) {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.value;

  const assertion = await signServiceAssertion(env);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new ArchiveError(503, "No pudimos acceder al archivo seguro ahora.", "google-auth-failed");
  const result = await response.json() as { access_token?: unknown; expires_in?: unknown };
  if (typeof result.access_token !== "string" || typeof result.expires_in !== "number") {
    throw new ArchiveError(503, "No pudimos acceder al archivo seguro ahora.", "google-auth-invalid");
  }
  cachedAccessToken = {
    value: result.access_token,
    expiresAt: Date.now() + Math.max(result.expires_in - 90, 60) * 1_000,
  };
  return cachedAccessToken.value;
}

export function databasePrefix(env: WorkerEnv) {
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/${env.FIRESTORE_DATABASE_ID || "(default)"}`;
}

function documentsBaseUrl(env: WorkerEnv) {
  return `https://firestore.googleapis.com/v1/${databasePrefix(env)}/documents`;
}

function documentName(env: WorkerEnv, path: string) {
  return `${databasePrefix(env)}/documents/${path}`;
}

async function firestoreRequest(env: WorkerEnv, path: string, init: RequestInit = {}) {
  const token = await getGoogleAccessToken(env);
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");
  const response = await fetch(`${documentsBaseUrl(env)}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const status = response.status === 409 ? 409 : 503;
    throw new ArchiveError(status, "No pudimos preservar esta memoria ahora. Inténtalo de nuevo.", "firestore-request-failed");
  }
  return response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function encodeFirestoreValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new ArchiveError(400, "La memoria contiene un valor no válido.", "invalid-number");
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  if (isRecord(value)) {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeFirestoreValue(item)])),
      },
    };
  }
  throw new ArchiveError(400, "La memoria contiene un valor no válido.", "unsupported-value");
}

export function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, item]) => [key, decodeFirestoreValue(item)]));
  return null;
}

export function decodeDocument(document: FirestoreDocument | undefined) {
  if (!document) return null;
  return Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

export async function beginTransaction(env: WorkerEnv) {
  const response = await firestoreRequest(env, ":beginTransaction", {
    method: "POST",
    body: "{}",
  });
  const payload = await response.json() as { transaction?: unknown };
  if (typeof payload.transaction !== "string" || !payload.transaction) {
    throw new ArchiveError(503, "No pudimos preservar esta memoria ahora. Inténtalo de nuevo.", "transaction-missing");
  }
  return payload.transaction;
}

export async function rollbackTransaction(env: WorkerEnv, transaction: string) {
  try {
    await firestoreRequest(env, ":rollback", {
      method: "POST",
      body: JSON.stringify({ transaction }),
    });
  } catch {
    // Firestore transactions also expire. A rollback is best-effort so the
    // original, user-facing error remains truthful.
  }
}

export async function readTransactionDocuments(env: WorkerEnv, transaction: string, paths: string[]) {
  if (!paths.length) return new Map<string, FirestoreDocument | undefined>();
  const response = await firestoreRequest(env, ":batchGet", {
    method: "POST",
    body: JSON.stringify({
      documents: paths.map((path) => documentName(env, path)),
      transaction,
    }),
  });
  const body = await response.text();
  const reads = body.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line) as FirestoreRead);
  const documents = new Map<string, FirestoreDocument | undefined>();
  for (const path of paths) documents.set(path, undefined);
  for (const read of reads) {
    const name = read.found?.name ?? read.missing;
    if (!name) continue;
    const prefix = `${databasePrefix(env)}/documents/`;
    if (!name.startsWith(prefix)) continue;
    documents.set(name.slice(prefix.length), read.found);
  }
  return documents;
}

export async function commitTransaction(env: WorkerEnv, transaction: string, writes: FirestoreWrite[]) {
  if (!writes.length) return;
  await firestoreRequest(env, ":commit", {
    method: "POST",
    body: JSON.stringify({ transaction, writes }),
  });
}

export async function listCollectionDocuments(
  env: WorkerEnv,
  collectionId: string,
  pageSize: number,
  pageToken?: string,
  orderBy = "__name__",
) {
  const search = new URLSearchParams({ pageSize: String(pageSize), orderBy });
  if (pageToken) search.set("pageToken", pageToken);
  const response = await firestoreRequest(env, `/${collectionId}?${search.toString()}`, { method: "GET" });
  const payload = await response.json() as { documents?: FirestoreDocument[]; nextPageToken?: string };
  return {
    documents: payload.documents ?? [],
    nextPageToken: typeof payload.nextPageToken === "string" && payload.nextPageToken ? payload.nextPageToken : null,
  };
}

export function createDocumentWrite(env: WorkerEnv, path: string, fields: Record<string, unknown>): FirestoreWrite {
  return {
    update: {
      name: documentName(env, path),
      fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encodeFirestoreValue(value)])),
    },
    currentDocument: { exists: false },
  };
}

export function mergeDocumentWrite(
  env: WorkerEnv,
  path: string,
  fields: Record<string, unknown>,
  updateTime?: string,
): FirestoreWrite {
  return {
    update: {
      name: documentName(env, path),
      fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encodeFirestoreValue(value)])),
    },
    updateMask: { fieldPaths: Object.keys(fields) },
    ...(updateTime ? { currentDocument: { updateTime } } : {}),
  };
}

export function deleteDocumentWrite(env: WorkerEnv, path: string, updateTime?: string): FirestoreWrite {
  return {
    delete: documentName(env, path),
    ...(updateTime ? { currentDocument: { updateTime } } : {}),
  };
}
