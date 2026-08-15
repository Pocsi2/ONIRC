import { describe, expect, it } from "vitest";
import { isPublicArchiveAvailable, publicArchiveState, resolvePublicArchiveConfiguration } from "@/lib/archive-state";

describe("public archive release gate", () => {
  it("stays frozen unless a release build explicitly enables it", () => {
    expect(publicArchiveState).toBe("frozen");
    expect(isPublicArchiveAvailable).toBe(false);
  });

  it("requires an explicit trusted Worker URL as well as the release flag", () => {
    expect(resolvePublicArchiveConfiguration("available", undefined)).toEqual({ state: "frozen", apiUrl: null });
    expect(resolvePublicArchiveConfiguration("available", "http://unsafe.example")).toEqual({ state: "frozen", apiUrl: null });
    expect(resolvePublicArchiveConfiguration("available", "https://archive.example/")).toEqual({
      state: "available",
      apiUrl: "https://archive.example",
    });
  });
});
