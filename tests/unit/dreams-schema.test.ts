import { describe, expect, it } from "vitest";
import { parsePersistedDreams, serializeDreams } from "@/lib/dreams-schema";

describe("dream storage schema", () => {
  it("migrates a Phase 5 local dream without discarding its narrative", () => {
    const result = parsePersistedDreams({
      version: 2,
      dreams: [{
        id: "marea-de-vidrio",
        date: "2026-08-12",
        title: "Marea de vidrio",
        body: "El mar entró por una ventana y dejó luz sobre el suelo.",
        summary: "El mar entró por una ventana.",
        feeling: "asombro",
        place: "casa",
        hue: "cyan",
      }],
    });

    expect(result?.migrated).toBe(true);
    expect(result?.dreams[0]).toMatchObject({
      id: "marea-de-vidrio",
      title: "Marea de vidrio",
      body: "El mar entró por una ventana y dejó luz sobre el suelo.",
      hue: "cyan",
    });
  });

  it("round-trips the versioned local envelope", () => {
    const dreams = [{
      id: "perla",
      date: "2026-08-12",
      title: "Una perla",
      body: "Un recuerdo suficientemente largo para poder conservarse.",
      hue: "lavender" as const,
      createdAt: "2026-08-12T12:00:00.000Z",
      updatedAt: "2026-08-12T12:00:00.000Z",
    }];
    const result = parsePersistedDreams(serializeDreams(dreams));
    expect(result).toEqual({ dreams, migrated: false });
  });

  it("rejects malformed local data instead of treating it as a dream", () => {
    expect(parsePersistedDreams({ version: 3, dreams: [{ id: "missing-fields" }] })).toBeNull();
  });
});
