import type { Unsubscribe } from "firebase/firestore";
import { hueForId, type Dream } from "@/lib/dreams";
import { isDreamRecord } from "@/lib/dreams-schema";
import { getFirebaseDb } from "@/lib/firebase";

type FirestoreSdk = typeof import("firebase/firestore");
type FirestoreClient = { sdk: FirestoreSdk; db: Awaited<ReturnType<typeof getFirebaseDb>> };

async function getFirestoreClient(): Promise<FirestoreClient> {
  const [sdk, db] = await Promise.all([import("firebase/firestore"), getFirebaseDb()]);
  return { sdk, db };
}

function dreamsCollection({ sdk, db }: FirestoreClient, userId: string) {
  return sdk.collection(db, "users", userId, "dreams");
}

function sameDream(left: Dream, right: Dream) {
  return left.date === right.date && left.title === right.title && left.body === right.body && left.hue === right.hue && left.createdAt === right.createdAt && left.updatedAt === right.updatedAt;
}

function conflictId(dream: Dream, usedIds: Set<string>) {
  const base = `${dream.id}-local-${dream.updatedAt.replace(/[^0-9]/g, "").slice(-8) || "copia"}`;
  let candidate = base;
  let count = 2;
  while (usedIds.has(candidate)) candidate = `${base}-${count++}`;
  return candidate;
}

/**
 * Combines two copies without silently discarding a divergent memory. The most
 * recently edited version keeps its id; the other becomes a clearly separate copy.
 */
export function mergeDreamCopies(localDreams: Dream[], remoteDreams: Dream[]) {
  const merged = new Map(remoteDreams.map((dream) => [dream.id, dream]));
  const usedIds = new Set(merged.keys());
  let conflicts = 0;

  for (const local of localDreams) {
    const remote = merged.get(local.id);
    if (!remote) {
      merged.set(local.id, local);
      usedIds.add(local.id);
      continue;
    }
    if (sameDream(local, remote)) continue;

    const localIsNewer = new Date(local.updatedAt).getTime() > new Date(remote.updatedAt).getTime();
    const retained = localIsNewer ? local : remote;
    const copied = localIsNewer ? remote : local;
    const copiedId = conflictId(copied, usedIds);
    merged.set(local.id, retained);
    merged.set(copiedId, { ...copied, id: copiedId, hue: hueForId(copiedId) });
    usedIds.add(copiedId);
    conflicts += 1;
  }

  return {
    dreams: [...merged.values()].sort((left, right) => left.date.localeCompare(right.date) || left.createdAt.localeCompare(right.createdAt)),
    conflicts,
  };
}

export async function loadCloudDreams(userId: string) {
  const client = await getFirestoreClient();
  const snapshot = await client.sdk.getDocs(dreamsCollection(client, userId));
  return snapshot.docs.map((item) => item.data()).filter(isDreamRecord);
}

export async function synchronizeDreams(userId: string, localDreams: Dream[]) {
  const remoteDreams = await loadCloudDreams(userId);
  const merged = mergeDreamCopies(localDreams, remoteDreams);
  const { db, sdk } = await getFirestoreClient();
  await sdk.setDoc(sdk.doc(db, "users", userId), { schemaVersion: 1, updatedAt: new Date().toISOString() }, { merge: true });
  for (let index = 0; index < merged.dreams.length; index += 450) {
    const batch = sdk.writeBatch(db);
    merged.dreams.slice(index, index + 450).forEach((dream) => batch.set(sdk.doc(db, "users", userId, "dreams", dream.id), dream));
    await batch.commit();
  }
  return merged;
}

export async function saveDreamToCloud(userId: string, dream: Dream) {
  const { db, sdk } = await getFirestoreClient();
  return sdk.setDoc(sdk.doc(db, "users", userId, "dreams", dream.id), dream);
}

export async function deleteDreamFromCloud(userId: string, dreamId: string) {
  const { db, sdk } = await getFirestoreClient();
  const batch = sdk.writeBatch(db);
  batch.delete(sdk.doc(db, "users", userId, "dreams", dreamId));
  return batch.commit();
}

export async function loadPublicName(userId: string) {
  const { db, sdk } = await getFirestoreClient();
  const snapshot = await sdk.getDoc(sdk.doc(db, "users", userId));
  const name = snapshot.data()?.publicName;
  return typeof name === "string" ? name : "";
}

export async function subscribeToCloudDreams(userId: string, onDreams: (dreams: Dream[]) => void, onError: (error: Error) => void): Promise<Unsubscribe> {
  const client = await getFirestoreClient();
  return client.sdk.onSnapshot(dreamsCollection(client, userId), (snapshot) => {
    onDreams(snapshot.docs.map((item) => item.data()).filter(isDreamRecord));
  }, (error) => onError(error));
}
