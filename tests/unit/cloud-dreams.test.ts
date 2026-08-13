import { describe, expect, it } from "vitest";
import { mergeDreamCopies } from "@/lib/cloud-dreams";
import type { Dream } from "@/lib/dreams";

const dream = (overrides: Partial<Dream> = {}): Dream => ({
  id: "estacion-rosa",
  date: "2026-08-12",
  title: "Estación rosa",
  body: "Un tren llegó sin hacer ruido.",
  hue: "blush",
  createdAt: "2026-08-12T10:00:00.000Z",
  updatedAt: "2026-08-12T10:00:00.000Z",
  ...overrides,
});

describe("cloud dream merge", () => {
  it("keeps unique local and remote memories", () => {
    const result = mergeDreamCopies([dream()], [dream({ id: "marea", title: "Marea" })]);
    expect(result.conflicts).toBe(0);
    expect(result.dreams).toHaveLength(2);
  });

  it("does not duplicate identical memories", () => {
    const item = dream();
    expect(mergeDreamCopies([item], [item])).toEqual({ dreams: [item], conflicts: 0 });
  });

  it("preserves both divergent versions instead of silently replacing one", () => {
    const local = dream({ body: "El tren dejó una luz azul.", updatedAt: "2026-08-13T10:00:00.000Z" });
    const remote = dream({ body: "El tren dejó una luz dorada.", updatedAt: "2026-08-14T10:00:00.000Z" });
    const result = mergeDreamCopies([local], [remote]);

    expect(result.conflicts).toBe(1);
    expect(result.dreams).toHaveLength(2);
    expect(result.dreams.map((item) => item.body)).toEqual(expect.arrayContaining([local.body, remote.body]));
  });
});
