export class ArchiveError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = "archive-error",
  ) {
    super(message);
  }
}

export function asArchiveError(error: unknown) {
  if (error instanceof ArchiveError) return error;
  return new ArchiveError(503, "No pudimos preservar esta memoria ahora. Inténtalo de nuevo.", "upstream-unavailable");
}
