import { createRemoteJWKSet, jwtVerify } from "jose";
import { ArchiveError } from "./errors";
import type { FirebaseIdentity, WorkerEnv } from "./types";

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function firebaseKeySet(projectId: string) {
  const existing = keySets.get(projectId);
  if (existing) return existing;
  // Google serves the same rotating signing keys that Firebase documents for
  // backend token verification. jose caches and refreshes the set by key id.
  const keySet = createRemoteJWKSet(
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
    { cooldownDuration: 30_000, cacheMaxAge: 60 * 60 * 1_000 },
  );
  keySets.set(projectId, keySet);
  return keySet;
}

export async function verifyFirebaseIdentity(request: Request, env: WorkerEnv): Promise<FirebaseIdentity> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new ArchiveError(401, "Necesitas una cuenta para continuar.", "missing-token");

  try {
    const now = Math.floor(Date.now() / 1_000);
    const { payload } = await jwtVerify(token, firebaseKeySet(env.FIREBASE_PROJECT_ID), {
      algorithms: ["RS256"],
      audience: env.FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
    });
    const uid = payload.sub;
    const issuedAt = payload.iat;
    const authTime = payload.auth_time;
    if (typeof uid !== "string" || !uid || uid.length > 128 || uid.includes("/")) throw new ArchiveError(401, "Tu sesión no es válida. Ingresa de nuevo.", "invalid-subject");
    if (typeof issuedAt !== "number" || issuedAt > now + 300) throw new ArchiveError(401, "Tu sesión no es válida. Ingresa de nuevo.", "invalid-issued-at");
    if (typeof authTime !== "number" || authTime > now + 300) throw new ArchiveError(401, "Tu sesión no es válida. Ingresa de nuevo.", "invalid-auth-time");
    return { uid, issuedAt, authTime };
  } catch (error) {
    if (error instanceof ArchiveError) throw error;
    throw new ArchiveError(401, "Tu sesión no es válida. Ingresa de nuevo.", "invalid-token");
  }
}
