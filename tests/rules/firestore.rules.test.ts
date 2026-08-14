import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const projectId = "onirc-rules-test";
let rules: RulesTestEnvironment;

function ownerDb() {
  return rules.authenticatedContext("owner-a").firestore();
}

function secondAccountDb() {
  return rules.authenticatedContext("owner-b").firestore();
}

function visitorDb() {
  return rules.unauthenticatedContext().firestore();
}

async function seed() {
  await rules.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, "users", "owner-a", "dreams", "private-dream"), {
      date: "2026-08-13",
      title: "Jardín de vidrio",
      body: "Una memoria privada que nunca debe salir de la cuenta de su dueña.",
      hue: "cyan",
      visibility: "private",
    });
    await setDoc(doc(admin, "users", "owner-a", "publicationLinks", "private-dream"), {
      publicId: "opaque-public-id",
      dreamId: "private-dream",
    });
    await setDoc(doc(admin, "publicDreams", "opaque-public-id"), {
      id: "opaque-public-id",
      visibility: "visible",
      schemaVersion: 1,
      date: "2026-08-13",
      title: "Fragmento compartido",
      body: "Una proyección pública no contiene identificadores internos de la memoria.",
      hue: "lavender",
      authorName: "Marea quieta",
      publishedAt: "2026-08-13T12:00:00.000Z",
    });
    // Legacy documents may exist until migration. They never satisfy the read rule.
    await setDoc(doc(admin, "publicDreams", "legacy-leak"), {
      ownerId: "owner-a",
      sourceDreamId: "private-dream",
      title: "Nunca legible",
    });
  });
}

beforeAll(async () => {
  rules = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"),
    },
  });
});

beforeEach(async () => {
  await rules.clearFirestore();
  await seed();
});

afterAll(async () => {
  await rules.cleanup();
});

describe("Firestore privacy boundary", () => {
  it("lets only the owner read and write their private memories", async () => {
    const owner = ownerDb();
    const privateDream = doc(owner, "users", "owner-a", "dreams", "private-dream");

    await assertSucceeds(getDoc(privateDream));
    await assertSucceeds(setDoc(doc(owner, "users", "owner-a", "dreams", "new-dream"), {
      date: "2026-08-12",
      title: "Nueva memoria",
      body: "Una memoria creada por la persona propietaria permanece en su espacio privado.",
      hue: "mint",
      visibility: "private",
    }));
  });

  it("denies a visitor and a second account access to private paths", async () => {
    const privatePathForVisitor = doc(visitorDb(), "users", "owner-a", "dreams", "private-dream");
    const privatePathForSecondAccount = doc(secondAccountDb(), "users", "owner-a", "dreams", "private-dream");

    await assertFails(getDoc(privatePathForVisitor));
    await assertFails(getDoc(privatePathForSecondAccount));
    await assertFails(deleteDoc(privatePathForSecondAccount));
  });

  it("allows only safe visible public projections and hides legacy documents", async () => {
    const visitor = visitorDb();
    const publicProjection = doc(visitor, "publicDreams", "opaque-public-id");
    const legacyProjection = doc(visitor, "publicDreams", "legacy-leak");
    const visibleFeed = query(collection(visitor, "publicDreams"), where("visibility", "==", "visible"));

    await assertSucceeds(getDoc(publicProjection));
    await assertSucceeds(getDocs(visibleFeed));
    await assertFails(getDoc(legacyProjection));
  });

  it("denies all direct browser writes to public projections and publication links", async () => {
    const owner = ownerDb();
    const publicProjection = doc(owner, "publicDreams", "forged-public-id");
    const publicationLink = doc(owner, "users", "owner-a", "publicationLinks", "private-dream");

    await assertFails(setDoc(publicProjection, {
      id: "forged-public-id",
      visibility: "visible",
      title: "Una publicación forjada",
    }));
    await assertFails(deleteDoc(publicationLink));
  });
});
