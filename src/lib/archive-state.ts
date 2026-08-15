export type PublicArchiveState = "available" | "frozen";

type PublicArchiveConfiguration = {
  state: PublicArchiveState;
  apiUrl: string | null;
};

function normalizeWorkerUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const isLocalHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !isLocalHttp) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * An accidental build variable must never enable the public archive by itself.
 * A release needs both an explicit state and the HTTPS address of the trusted
 * Worker; otherwise every public control and feed remains frozen.
 */
export function resolvePublicArchiveConfiguration(
  requestedState: string | undefined,
  requestedApiUrl: string | undefined,
): PublicArchiveConfiguration {
  const apiUrl = normalizeWorkerUrl(requestedApiUrl);
  if (requestedState !== "available" || !apiUrl) return { state: "frozen", apiUrl: null };
  return { state: "available", apiUrl };
}

const publicArchive = resolvePublicArchiveConfiguration(
  process.env.NEXT_PUBLIC_PUBLIC_ARCHIVE_STATE,
  process.env.NEXT_PUBLIC_PUBLIC_ARCHIVE_API_URL,
);

export const publicArchiveState = publicArchive.state;
export const publicArchiveApiUrl = publicArchive.apiUrl;
export const isPublicArchiveAvailable = publicArchiveState === "available";
