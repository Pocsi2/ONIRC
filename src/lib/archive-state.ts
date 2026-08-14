/**
 * Public publication remains intentionally unavailable until the trusted
 * Functions deployment and migration have been verified in production.
 */
export const publicArchiveState = process.env.NEXT_PUBLIC_PUBLIC_ARCHIVE_STATE === "available" ? "available" : "frozen";
export const isPublicArchiveAvailable = publicArchiveState === "available";
