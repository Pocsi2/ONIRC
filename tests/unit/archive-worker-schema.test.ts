import { describe, expect, it } from "vitest";
import { buildSafeProjection, decodePrivateDream, isSafePublicProjection, normalizePseudonym } from "../../workers/archive/src/schema";

const source = {
  date: "2026-08-14",
  title: "El jardín sin reloj",
  body: "Las piedras guardaban una luz tibia que no pertenecía a ninguna hora.",
  hue: "lavender" as const,
};

describe("public archive Worker schema", () => {
  it("creates an exact safe public projection", () => {
    const projection = buildSafeProjection(
      "p_4a82b1150a37484f9c87f1a3d3aa7777",
      source,
      "Marea quieta",
      "2026-08-14T12:00:00.000Z",
    );

    expect(isSafePublicProjection(projection)).toBe(true);
    expect(Object.keys(projection).sort()).toEqual([
      "authorName",
      "body",
      "date",
      "hue",
      "id",
      "publishedAt",
      "schemaVersion",
      "title",
      "visibility",
    ]);
  });

  it("rejects leaked identifiers, unknown fields, and impossible calendar dates", () => {
    const projection = buildSafeProjection(
      "p_4a82b1150a37484f9c87f1a3d3aa7777",
      source,
      "Marea quieta",
      "2026-08-14T12:00:00.000Z",
    );

    expect(isSafePublicProjection({ ...projection, ownerId: "account-a" })).toBe(false);
    expect(isSafePublicProjection({ ...projection, sourceDreamId: "private-memory" })).toBe(false);
    expect(decodePrivateDream({ ...source, date: "2026-02-30" })).toBeNull();
  });

  it("keeps the signature intentionally pseudonymous and bounded", () => {
    expect(normalizePseudonym("  Marea   quieta ")).toBe("Marea quieta");
    expect(normalizePseudonym("x")).toBeNull();
    expect(normalizePseudonym("x".repeat(33))).toBeNull();
    expect(normalizePseudonym("nombre@correo.com")).toBeNull();
  });
});
