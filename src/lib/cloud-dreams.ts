import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { hueForId, type Dream } from "@/lib/dreams";
import { isDreamRecord } from "@/lib/dreams-schema";
import { firebaseDb } from "@/lib/firebase";

function dreamsCollection(userId: string) {
  return collection(firebaseDb, "users", userId, "dreams");
}

export type PublicDream = Pick<Dream, "date" | "title" | "body" | "hue" | "createdAt" | "updatedAt"> & {
  id: string;
  ownerId: string;
  sourceDreamId: string;
  publishedAt: string;
  authorName: string;
};

function isPublicDreamRecord(value: unknown): value is PublicDream {
  if (!value || typeof value !== "object") return false;
  const dream = value as Partial<PublicDream>;
  return typeof dream.id === "string" && typeof dream.ownerId === "string" && typeof dream.sourceDreamId === "string" && typeof dream.date === "string" && typeof dream.title === "string" && typeof dream.body === "string" && typeof dream.hue === "string" && typeof dream.createdAt === "string" && typeof dream.updatedAt === "string" && typeof dream.publishedAt === "string" && typeof dream.authorName === "string";
}

function publicDreamId(userId: string, dreamId: string) {
  return `${userId}_${dreamId}`;
}

function toPublicDream(userId: string, dream: Dream, authorName: string): PublicDream {
  return {
    id: publicDreamId(userId, dream.id),
    ownerId: userId,
    sourceDreamId: dream.id,
    date: dream.date,
    title: dream.title,
    body: dream.body,
    hue: dream.hue,
    createdAt: dream.createdAt,
    updatedAt: dream.updatedAt,
    publishedAt: new Date().toISOString(),
    authorName,
  };
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
  const snapshot = await getDocs(dreamsCollection(userId));
  return snapshot.docs.map((item) => item.data()).filter(isDreamRecord);
}

export async function synchronizeDreams(userId: string, localDreams: Dream[]) {
  const remoteDreams = await loadCloudDreams(userId);
  const merged = mergeDreamCopies(localDreams, remoteDreams);
  await setDoc(doc(firebaseDb, "users", userId), { schemaVersion: 1, updatedAt: new Date().toISOString() }, { merge: true });
  for (let index = 0; index < merged.dreams.length; index += 450) {
    const batch = writeBatch(firebaseDb);
    merged.dreams.slice(index, index + 450).forEach((dream) => batch.set(doc(firebaseDb, "users", userId, "dreams", dream.id), dream));
    await batch.commit();
  }
  return merged;
}

export function saveDreamToCloud(userId: string, dream: Dream) {
  return setDoc(doc(firebaseDb, "users", userId, "dreams", dream.id), dream);
}

export function deleteDreamFromCloud(userId: string, dreamId: string) {
  const batch = writeBatch(firebaseDb);
  batch.delete(doc(firebaseDb, "users", userId, "dreams", dreamId));
  return batch.commit();
}

export function loadPublicName(userId: string) {
  return getDoc(doc(firebaseDb, "users", userId)).then((snapshot) => {
    const name = snapshot.data()?.publicName;
    return typeof name === "string" ? name : "";
  });
}

export function publishDreamToCloud(userId: string, dream: Dream, authorName: string) {
  return setDoc(doc(firebaseDb, "publicDreams", publicDreamId(userId, dream.id)), toPublicDream(userId, dream, authorName));
}

export function savePublicName(userId: string, authorName: string) {
  return setDoc(doc(firebaseDb, "users", userId), { publicName: authorName, updatedAt: new Date().toISOString() }, { merge: true });
}

export function removePublicDreamFromCloud(userId: string, dreamId: string) {
  const batch = writeBatch(firebaseDb);
  batch.delete(doc(firebaseDb, "publicDreams", publicDreamId(userId, dreamId)));
  return batch.commit();
}

export function subscribeToCloudDreams(userId: string, onDreams: (dreams: Dream[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(dreamsCollection(userId), (snapshot) => {
    onDreams(snapshot.docs.map((item) => item.data()).filter(isDreamRecord));
  }, (error) => onError(error));
}

export function subscribeToPublicDreams(onDreams: (dreams: PublicDream[]) => void, onError: (error: Error) => void): Unsubscribe {
  const publicQuery = query(collection(firebaseDb, "publicDreams"), orderBy("publishedAt", "desc"), limit(36));
  return onSnapshot(publicQuery, (snapshot) => {
    onDreams(snapshot.docs.map((item) => item.data()).filter(isPublicDreamRecord));
  }, (error) => onError(error));
}
