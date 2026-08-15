import { describe, expect, it } from "vitest";
import worker from "../src/index";
import type { WorkerEnv } from "../src/types";

const env: WorkerEnv = {
  FIREBASE_PROJECT_ID: "onirc-production",
  FIRESTORE_DATABASE_ID: "(default)",
  ALLOWED_ORIGINS: "https://pocsi2.github.io,http://localhost:3000",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "not-used@example.test",
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "not-used",
  MIGRATION_ADMIN_UIDS: "admin-uid",
};

describe("public archive Worker boundary", () => {
  it("exposes only a small health route without credentials", async () => {
    const response = await worker.fetch(new Request("https://archive.example/v1/archive/health"), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ready", schemaVersion: 2 });
  });

  it("requires a Firebase token before a mutation is parsed or processed", async () => {
    const response = await worker.fetch(new Request("https://archive.example/v1/archive/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dreamId: "private-memory", authorName: "Marea quieta" }),
    }), env);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "missing-token" });
  });

  it("allows preflight only from the explicit Pages origin", async () => {
    const allowed = await worker.fetch(new Request("https://archive.example/v1/archive/publish", {
      method: "OPTIONS",
      headers: { origin: "https://pocsi2.github.io" },
    }), env);
    const blocked = await worker.fetch(new Request("https://archive.example/v1/archive/health", {
      headers: { origin: "https://untrusted.example" },
    }), env);

    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://pocsi2.github.io");
    expect(blocked.status).toBe(403);
  });
});
