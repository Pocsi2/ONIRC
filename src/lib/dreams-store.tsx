"use client";

import * as React from "react";
import { hueForId, slugifyDream, type Dream, type DreamDraft, type SavedDraft } from "@/lib/dreams";
import { deleteDreamFromCloud, loadPublicName, publishDreamToCloud, removePublicDreamFromCloud, saveDreamToCloud, savePublicName, subscribeToCloudDreams, synchronizeDreams } from "@/lib/cloud-dreams";
import { useAuthSession } from "@/lib/auth-store";
import { clearAllLocalDreams, clearDraft, loadDraft, loadDreams, saveDraft, saveDreams, type PersistenceStatus } from "@/lib/dreams-repository";
import { normalizeDraft } from "@/lib/dreams-schema";

type LocalDreamState = {
  dreams: Dream[];
  isReady: boolean;
  persistence: PersistenceStatus;
  savedDraft: SavedDraft | null;
};

export type CloudSyncState = {
  status: "signed-out" | "ready" | "syncing" | "synced" | "error";
  message?: string;
  publicName?: string;
};

type DreamStoreValue = LocalDreamState & {
  addDream: (draft: DreamDraft) => Dream;
  updateDream: (id: string, draft: DreamDraft) => Dream | undefined;
  removeDream: (id: string) => Dream | undefined;
  restoreDream: (dream: Dream) => void;
  resetDreams: () => void;
  getDream: (id: string) => Dream | undefined;
  saveLocalDraft: (draft: DreamDraft) => void;
  clearLocalDraft: () => void;
  cloud: CloudSyncState;
  synchronizeWithCloud: () => Promise<void>;
  publishDream: (id: string, publicName: string) => Promise<void>;
  makeDreamPrivate: (id: string) => Promise<void>;
};

const emptyState: LocalDreamState = { dreams: [], isReady: false, persistence: { kind: "ready" }, savedDraft: null };
let currentState = emptyState;
let didLoad = false;
const listeners = new Set<() => void>();
const DreamStoreContext = React.createContext<DreamStoreValue | null>(null);

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(next: LocalDreamState) {
  currentState = next;
  notify();
}

function ensureLoaded() {
  if (didLoad || typeof window === "undefined") return;
  didLoad = true;
  const result = loadDreams();
  currentState = { dreams: result.dreams, persistence: result.status, savedDraft: loadDraft(), isReady: true };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  listener();

  function syncFromAnotherTab(event: StorageEvent) {
    if (event.key !== "onirc:dreams:v3") return;
    const result = loadDreams();
    setState({ ...currentState, dreams: result.dreams, persistence: result.status, isReady: true });
  }
  window.addEventListener("storage", syncFromAnotherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncFromAnotherTab);
  };
}

function getClientSnapshot() {
  ensureLoaded();
  return currentState;
}

function idForDream(title: string) {
  return `${slugifyDream(title) || "sueno"}-${Date.now().toString(36)}`;
}

function makeDream(draft: DreamDraft, id: string, createdAt?: string): Dream {
  const clean = normalizeDraft(draft);
  const now = new Date().toISOString();
  return { id, ...clean, hue: hueForId(id), createdAt: createdAt ?? now, updatedAt: now, visibility: "private" };
}

export function DreamStoreProvider({ children }: { children: React.ReactNode }) {
  const state = React.useSyncExternalStore(subscribe, getClientSnapshot, () => emptyState);
  const { ready: authReady, user } = useAuthSession();
  const [cloud, setCloud] = React.useState<CloudSyncState>({ status: "signed-out" });
  const unsubscribeCloudRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    unsubscribeCloudRef.current?.();
    unsubscribeCloudRef.current = null;
    if (!authReady) return;
    const timer = window.setTimeout(() => {
      if (!user) {
        setCloud({ status: "signed-out" });
        return;
      }
      void loadPublicName(user.uid).then((publicName) => setCloud({ status: "ready", publicName, message: "Tu cuenta está lista. Tus recuerdos aún permanecen sólo en este navegador." })).catch(() => setCloud({ status: "ready", message: "Tu cuenta está lista. Tus recuerdos aún permanecen sólo en este navegador." }));
    }, 0);
    return () => {
      window.clearTimeout(timer);
      unsubscribeCloudRef.current?.();
    };
  }, [authReady, user]);

  const beginCloudSubscription = React.useCallback((userId: string) => {
    unsubscribeCloudRef.current?.();
    unsubscribeCloudRef.current = subscribeToCloudDreams(
      userId,
      (cloudDreams) => {
        const local = getClientSnapshot().dreams;
        // After explicit activation, Firestore is the shared copy. Local storage
        // remains a durable offline cache for this browser.
        setState({ ...getClientSnapshot(), dreams: cloudDreams, persistence: saveDreams(cloudDreams), isReady: true });
        if (local.length !== cloudDreams.length) setCloud((currentCloud) => ({ ...currentCloud, status: "synced", message: "Tus recuerdos están sincronizados de forma privada." }));
      },
      () => setCloud((currentCloud) => ({ ...currentCloud, status: "error", message: "No se pudo actualizar la copia privada. Tus recuerdos locales siguen a salvo." })),
    );
  }, []);

  const synchronizeWithCloud = React.useCallback(async () => {
    if (!user) return;
    setCloud((currentCloud) => ({ ...currentCloud, status: "syncing", message: "Uniendo tus copias con cuidado…" }));
    try {
      const result = await synchronizeDreams(user.uid, getClientSnapshot().dreams);
      setState({ ...getClientSnapshot(), dreams: result.dreams, persistence: saveDreams(result.dreams), isReady: true });
      beginCloudSubscription(user.uid);
      setCloud({
        status: "synced",
        publicName: cloud.publicName,
        message: result.conflicts
          ? `Tus recuerdos están sincronizados. Conservamos ${result.conflicts} copia${result.conflicts === 1 ? "" : "s"} para no perder versiones distintas.`
          : "Tus recuerdos están sincronizados de forma privada.",
      });
    } catch {
      setCloud((currentCloud) => ({ ...currentCloud, status: "error", message: "No fue posible sincronizar ahora. Tus recuerdos locales siguen a salvo." }));
    }
  }, [beginCloudSubscription, cloud.publicName, user]);

  const addDream = React.useCallback((draft: DreamDraft) => {
    const dream = makeDream(draft, idForDream(draft.title));
    const dreams = [...getClientSnapshot().dreams, dream];
    setState({ ...getClientSnapshot(), dreams, persistence: saveDreams(dreams), isReady: true });
    if (user && cloud.status === "synced") void saveDreamToCloud(user.uid, dream).catch(() => setCloud({ status: "error", message: "Este recuerdo quedó localmente; la copia privada no pudo actualizarse." }));
    return dream;
  }, [cloud.status, user]);

  const updateDream = React.useCallback((id: string, draft: DreamDraft) => {
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current) return undefined;
    const updated = { ...makeDream(draft, id, current.createdAt), hue: current.hue, visibility: current.visibility ?? "private" };
    const dreams = snapshot.dreams.map((dream) => (dream.id === id ? updated : dream));
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    if (user && cloud.status === "synced") void Promise.all([saveDreamToCloud(user.uid, updated), ...(updated.visibility === "public" && cloud.publicName ? [publishDreamToCloud(user.uid, updated, cloud.publicName)] : [])]).catch(() => setCloud({ status: "error", message: "El cambio quedó localmente; la copia privada no pudo actualizarse." }));
    return updated;
  }, [cloud.publicName, cloud.status, user]);

  const removeDream = React.useCallback((id: string) => {
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current) return undefined;
    const dreams = snapshot.dreams.filter((dream) => dream.id !== id);
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    if (user && cloud.status === "synced") void Promise.all([deleteDreamFromCloud(user.uid, id), ...(current.visibility === "public" ? [removePublicDreamFromCloud(user.uid, id)] : [])]).catch(() => setCloud({ status: "error", message: "El borrado quedó localmente; la copia privada no pudo actualizarse." }));
    return current;
  }, [cloud.status, user]);

  const restoreDream = React.useCallback((dream: Dream) => {
    const snapshot = getClientSnapshot();
    const dreams = snapshot.dreams.some((item) => item.id === dream.id) ? snapshot.dreams : [...snapshot.dreams, dream];
    setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    if (user && cloud.status === "synced") void Promise.all([saveDreamToCloud(user.uid, dream), ...(dream.visibility === "public" && cloud.publicName ? [publishDreamToCloud(user.uid, dream, cloud.publicName)] : [])]).catch(() => setCloud({ status: "error", message: "La restauración quedó localmente; la copia privada no pudo actualizarse." }));
  }, [cloud.publicName, cloud.status, user]);

  const publishDream = React.useCallback(async (id: string, publicName: string) => {
    if (!user || cloud.status !== "synced") return;
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current || current.visibility === "public") return;
    const cleanName = publicName.trim().slice(0, 32);
    if (cleanName.length < 2) return;
    const published = { ...current, visibility: "public" as const, updatedAt: new Date().toISOString() };
    try {
      await Promise.all([saveDreamToCloud(user.uid, published), savePublicName(user.uid, cleanName), publishDreamToCloud(user.uid, published, cleanName)]);
      const dreams = snapshot.dreams.map((dream) => dream.id === id ? published : dream);
      setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
      setCloud((currentCloud) => ({ ...currentCloud, publicName: cleanName }));
    } catch {
      setCloud((currentCloud) => ({ ...currentCloud, status: "error", message: "No fue posible compartir este recuerdo. Sigue siendo privado." }));
    }
  }, [cloud.status, user]);

  const makeDreamPrivate = React.useCallback(async (id: string) => {
    if (!user || cloud.status !== "synced") return;
    const snapshot = getClientSnapshot();
    const current = snapshot.dreams.find((dream) => dream.id === id);
    if (!current || current.visibility !== "public") return;
    const privateDream = { ...current, visibility: "private" as const, updatedAt: new Date().toISOString() };
    try {
      await Promise.all([saveDreamToCloud(user.uid, privateDream), removePublicDreamFromCloud(user.uid, id)]);
      const dreams = snapshot.dreams.map((dream) => dream.id === id ? privateDream : dream);
      setState({ ...snapshot, dreams, persistence: saveDreams(dreams), isReady: true });
    } catch {
      setCloud((currentCloud) => ({ ...currentCloud, status: "error", message: "No fue posible retirar la publicación. El recuerdo sigue público hasta que se confirme el cambio." }));
    }
  }, [cloud.status, user]);

  const resetDreams = React.useCallback(() => {
    clearAllLocalDreams();
    setState({ dreams: [], savedDraft: null, isReady: true, persistence: { kind: "ready", message: "El calendario local quedó en blanco." } });
  }, []);

  const saveLocalDraft = React.useCallback((draft: DreamDraft) => {
    const savedDraft = { ...normalizeDraft(draft), updatedAt: new Date().toISOString() };
    saveDraft(savedDraft);
    setState({ ...getClientSnapshot(), savedDraft });
  }, []);

  const clearLocalDraft = React.useCallback(() => {
    clearDraft();
    setState({ ...getClientSnapshot(), savedDraft: null });
  }, []);

  const value = React.useMemo(
    () => ({ ...state, addDream, updateDream, removeDream, restoreDream, resetDreams, getDream: (id: string) => state.dreams.find((dream) => dream.id === id), saveLocalDraft, clearLocalDraft, cloud, synchronizeWithCloud, publishDream, makeDreamPrivate }),
    [addDream, clearLocalDraft, cloud, makeDreamPrivate, publishDream, removeDream, resetDreams, restoreDream, saveLocalDraft, state, synchronizeWithCloud, updateDream],
  );

  return <DreamStoreContext.Provider value={value}>{children}</DreamStoreContext.Provider>;
}

export function useDreamStore() {
  const context = React.useContext(DreamStoreContext);
  if (!context) throw new Error("useDreamStore must be used inside DreamStoreProvider");
  return context;
}
