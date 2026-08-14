import { describe, expect, it } from "vitest";
import { isPublicArchiveAvailable, publicArchiveState } from "@/lib/public-archive";

describe("public archive release gate", () => {
  it("stays frozen unless a release build explicitly enables it", () => {
    expect(publicArchiveState).toBe("frozen");
    expect(isPublicArchiveAvailable).toBe(false);
  });
});
