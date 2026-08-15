import { asArchiveError, ArchiveError } from "./errors";
import { verifyFirebaseIdentity } from "./firebase-auth";
import {
  beginTransaction,
  commitTransaction,
  createDocumentWrite,
  decodeDocument,
  deleteDocumentWrite,
  listCollectionDocuments,
  mergeDocumentWrite,
  readTransactionDocuments,
  rollbackTransaction,
} from "./firestore";
import {
  buildSafeProjection,
  decodePrivateDream,
  isArchiveReportReason,
  isDreamId,
  isPublicId,
  isSafePublicProjection,
  normalizePseudonym,
} from "./schema";
import type { FirestoreDocument, FirestoreWrite, WorkerEnv } from "./types";

const API_PREFIX = "/v1/archive";
const MAX_REQUEST_BODY_BYTES = 16_000;
const LEGACY_RETIREMENT_PAGE_SIZE = 10;

type JsonRecord = Record<string, unknown>;
type TransactionResult<T> = { value: T; writes: FirestoreWrite[] };

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function responseHeaders(origin?: string | null) {
  const headers = new Headers({
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-headers", "authorization, content-type");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    headers.set("access-control-max-age", "600");
    headers.set("vary", "Origin");
  }
  return headers;
}

function json(value: unknown, status = 200, origin?: string | null, cacheControl = "no-store") {
  const headers = responseHeaders(origin);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", cacheControl);
  return new Response(JSON.stringify(value), { status, headers });
}

function allowedOrigins(env: WorkerEnv) {
  return new Set(
    env.ALLOWED_ORIGINS
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function requestOrigin(request: Request, env: WorkerEnv) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  let normalized = "";
  try {
    normalized = new URL(origin).origin;
  } catch {
    throw new ArchiveError(403, "Esta procedencia no puede acceder al archivo.", "invalid-origin");
  }
  if (!allowedOrigins(env).has(normalized)) {
    throw new ArchiveError(403, "Esta procedencia no puede acceder al archivo.", "forbidden-origin");
  }
  return normalized;
}

async function readJson(request: Request): Promise<JsonRecord> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    throw new ArchiveError(413, "La solicitud es demasiado extensa.", "body-too-large");
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ArchiveError(415, "La solicitud debe usar JSON.", "unsupported-content-type");
  }
  const text = await request.text();
  if (text.length > MAX_REQUEST_BODY_BYTES) throw new ArchiveError(413, "La solicitud es demasiado extensa.", "body-too-large");
  try {
    const value = JSON.parse(text);
    if (!isRecord(value)) throw new ArchiveError(400, "La solicitud no tiene un formato válido.", "invalid-payload");
    return value;
  } catch (error) {
    if (error instanceof ArchiveError) throw error;
    throw new ArchiveError(400, "La solicitud no tiene un formato válido.", "invalid-json");
  }
}

function stringField(value: JsonRecord, field: string) {
  const item = value[field];
  if (typeof item !== "string") throw new ArchiveError(400, "La solicitud no tiene un formato válido.", "invalid-payload");
  return item;
}

function privateDreamPath(uid: string, dreamId: string) {
  return "users/" + uid + "/dreams/" + dreamId;
}

function publicationLinkPath(uid: string, dreamId: string) {
  return "users/" + uid + "/publicationLinks/" + dreamId;
}

function userPath(uid: string) {
  return "users/" + uid;
}

function publicDreamPath(publicId: string) {
  return "publicDreams/" + publicId;
}

function randomId(prefix: string) {
  return prefix + crypto.randomUUID().replace(/-/g, "");
}

async function withTransaction<T>(
  env: WorkerEnv,
  action: (transaction: string) => Promise<TransactionResult<T>>,
) {
  const transaction = await beginTransaction(env);
  try {
    const result = await action(transaction);
    await commitTransaction(env, transaction, result.writes);
    return result.value;
  } catch (error) {
    await rollbackTransaction(env, transaction);
    throw error;
  }
}

function documentValue(document: FirestoreDocument | undefined) {
  return document ? decodeDocument(document) : null;
}

function safeProjectionFromDocument(document: FirestoreDocument | undefined) {
  const projection = documentValue(document);
  if (!document || !isSafePublicProjection(projection)) return null;
  return document.name.endsWith("/documents/" + publicDreamPath(projection.id)) ? projection : null;
}

function requireAdmin(uid: string, env: WorkerEnv) {
  const administrators = new Set(
    env.MIGRATION_ADMIN_UIDS
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  if (!administrators.has(uid)) {
    throw new ArchiveError(403, "Esta operación requiere administración del archivo.", "admin-required");
  }
}

async function publish(request: Request, env: WorkerEnv) {
  const identity = await verifyFirebaseIdentity(request, env);
  const payload = await readJson(request);
  const dreamId = stringField(payload, "dreamId");
  const authorName = normalizePseudonym(payload.authorName);
  if (!isDreamId(dreamId)) throw new ArchiveError(404, "No encontramos esa memoria.", "dream-not-found");
  if (!authorName) throw new ArchiveError(400, "Elige una firma pública de 2 a 32 caracteres.", "invalid-signature");

  const sourcePath = privateDreamPath(identity.uid, dreamId);
  const linkPath = publicationLinkPath(identity.uid, dreamId);
  const now = new Date().toISOString();
  const publicId = randomId("p_");

  return withTransaction(env, async (transaction) => {
    const documents = await readTransactionDocuments(env, transaction, [sourcePath, linkPath]);
    const sourceDocument = documents.get(sourcePath);
    const linkDocument = documents.get(linkPath);
    if (!sourceDocument) throw new ArchiveError(404, "No encontramos esa memoria privada.", "dream-not-found");
    if (linkDocument) throw new ArchiveError(409, "Esta memoria ya tiene una copia pública.", "already-published");
    const source = decodePrivateDream(documentValue(sourceDocument));
    if (!source) throw new ArchiveError(422, "Esta memoria no tiene un formato que pueda publicarse.", "invalid-private-dream");

    const projection = buildSafeProjection(publicId, source, authorName, now);
    return {
      value: { publicId },
      writes: [
        createDocumentWrite(env, publicDreamPath(publicId), projection),
        createDocumentWrite(env, linkPath, {
          publicId,
          authorName,
          publishedAt: now,
          schemaVersion: 2,
        }),
        mergeDocumentWrite(env, userPath(identity.uid), { publicName: authorName, updatedAt: now }),
        mergeDocumentWrite(env, sourcePath, { visibility: "public", updatedAt: now }, sourceDocument.updateTime),
      ],
    };
  });
}

async function unpublish(request: Request, env: WorkerEnv) {
  const identity = await verifyFirebaseIdentity(request, env);
  const payload = await readJson(request);
  const dreamId = stringField(payload, "dreamId");
  if (!isDreamId(dreamId)) throw new ArchiveError(404, "No encontramos esa memoria.", "dream-not-found");

  const sourcePath = privateDreamPath(identity.uid, dreamId);
  const linkPath = publicationLinkPath(identity.uid, dreamId);
  const now = new Date().toISOString();

  return withTransaction(env, async (transaction) => {
    const documents = await readTransactionDocuments(env, transaction, [sourcePath, linkPath]);
    const sourceDocument = documents.get(sourcePath);
    const linkDocument = documents.get(linkPath);
    const link = documentValue(linkDocument);
    const publicId = isRecord(link) && isPublicId(link.publicId) ? link.publicId : null;
    if (!linkDocument || !publicId) {
      throw new ArchiveError(404, "No encontramos una copia pública para esta memoria.", "publication-not-found");
    }

    const writes: FirestoreWrite[] = [
      deleteDocumentWrite(env, publicDreamPath(publicId)),
      deleteDocumentWrite(env, linkPath, linkDocument.updateTime),
    ];
    if (sourceDocument) {
      writes.push(mergeDocumentWrite(env, sourcePath, { visibility: "private", updatedAt: now }, sourceDocument.updateTime));
    }
    return { value: { publicId }, writes };
  });
}

async function report(request: Request, env: WorkerEnv) {
  const identity = await verifyFirebaseIdentity(request, env);
  const payload = await readJson(request);
  const publicId = stringField(payload, "publicId");
  const reason = payload.reason;
  if (!isPublicId(publicId)) throw new ArchiveError(404, "No encontramos esa publicación.", "public-not-found");
  if (!isArchiveReportReason(reason)) throw new ArchiveError(400, "Elige un motivo de reporte válido.", "invalid-report-reason");

  const publicPath = publicDreamPath(publicId);
  const reportId = randomId("r_");
  const now = new Date().toISOString();

  return withTransaction(env, async (transaction) => {
    const documents = await readTransactionDocuments(env, transaction, [publicPath]);
    const projection = safeProjectionFromDocument(documents.get(publicPath));
    if (!projection || projection.id !== publicId) {
      throw new ArchiveError(404, "Esta publicación ya no está disponible.", "public-not-found");
    }
    return {
      value: { reportId },
      writes: [
        createDocumentWrite(env, "moderationReports/" + reportId, {
          publicId,
          reporterId: identity.uid,
          reason,
          status: "pending",
          createdAt: now,
        }),
      ],
    };
  });
}

async function retireLegacy(request: Request, env: WorkerEnv) {
  const identity = await verifyFirebaseIdentity(request, env);
  requireAdmin(identity.uid, env);
  const payload = await readJson(request);
  const cursor = payload.cursor;
  if (cursor !== undefined && (typeof cursor !== "string" || cursor.length > 2_048)) {
    throw new ArchiveError(400, "El cursor de migración no es válido.", "invalid-cursor");
  }

  const page = await listCollectionDocuments(
    env,
    "publicDreams",
    LEGACY_RETIREMENT_PAGE_SIZE,
    typeof cursor === "string" ? cursor : undefined,
  );
  const unsafeDocuments = page.documents.filter((document) => !safeProjectionFromDocument(document));
  if (unsafeDocuments.length) {
    await withTransaction(env, async () => ({
      value: undefined,
      writes: unsafeDocuments.map((document) => deleteDocumentWrite(env, document.name.replace(/^.+\/documents\//, ""), document.updateTime)),
    }));
  }

  return {
    scanned: page.documents.length,
    retired: unsafeDocuments.length,
    nextCursor: page.nextPageToken,
    complete: !page.nextPageToken,
  };
}

async function publicFeed(env: WorkerEnv) {
  // Browsers never read publicDreams directly. The Worker returns only values
  // that satisfy the same closed schema it writes, so a malformed legacy
  // document cannot become a data leak while retirement is in progress.
  const page = await listCollectionDocuments(env, "publicDreams", 36, undefined, "publishedAt desc");
  const dreams = page.documents.flatMap((document) => {
    const projection = safeProjectionFromDocument(document);
    return projection ? [projection] : [];
  });
  return { dreams };
}

async function handle(request: Request, env: WorkerEnv) {
  const path = new URL(request.url).pathname;
  if (request.method === "GET" && path === API_PREFIX + "/health") {
    return { status: 200, body: { status: "ready", service: "onirc-public-archive", schemaVersion: 2 }, cacheControl: "no-store" };
  }
  if (request.method === "GET" && path === API_PREFIX + "/feed") {
    return {
      status: 200,
      body: await publicFeed(env),
      cacheControl: "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
    };
  }
  if (request.method === "POST" && path === API_PREFIX + "/publish") {
    return { status: 201, body: await publish(request, env), cacheControl: "no-store" };
  }
  if (request.method === "POST" && path === API_PREFIX + "/unpublish") {
    return { status: 200, body: await unpublish(request, env), cacheControl: "no-store" };
  }
  if (request.method === "POST" && path === API_PREFIX + "/report") {
    return { status: 201, body: await report(request, env), cacheControl: "no-store" };
  }
  if (request.method === "POST" && path === API_PREFIX + "/retire-legacy") {
    return { status: 200, body: await retireLegacy(request, env), cacheControl: "no-store" };
  }
  throw new ArchiveError(404, "No encontramos esa ruta del archivo.", "route-not-found");
}

const worker: ExportedHandler<WorkerEnv> = {
  async fetch(request, env) {
    let origin: string | null = null;
    try {
      origin = requestOrigin(request, env);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: responseHeaders(origin) });
      const response = await handle(request, env);
      return json(response.body, response.status, origin, response.cacheControl);
    } catch (error) {
      const archiveError = asArchiveError(error);
      return json({ error: archiveError.code, message: archiveError.message }, archiveError.status, origin);
    }
  },
};

export default worker;
