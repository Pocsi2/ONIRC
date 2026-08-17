"use client";

import { Cloud, CloudOff, CloudUpload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/lib/auth-store";
import { useDreamStore } from "@/lib/dreams-store";

export function CloudSyncControl() {
  const { ready, user } = useAuthSession();
  const { cloud, synchronizeWithCloud } = useDreamStore();

  if (!ready || !user) return null;

  const isSyncing = cloud.status === "syncing";
  const isSynced = cloud.status === "synced";
  if (isSynced) return null;
  const Icon = isSynced ? Cloud : cloud.status === "error" ? CloudOff : isSyncing ? LoaderCircle : CloudUpload;

  return (
    <section className="mt-5 flex max-w-xl flex-col gap-3 border-t border-[var(--border-quiet)] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Copia privada">
      <div className="flex min-w-0 items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isSyncing ? "animate-spin" : ""} ${cloud.status === "error" ? "text-memory-accessible" : "text-text-secondary"}`} aria-hidden="true" />
        <p role="status" aria-live="polite" className="text-sm leading-6 text-text-secondary">{cloud.message ?? "Sincroniza tus datos entre dispositivos."}</p>
      </div>
      {!isSyncing ? (
        <Button variant="secondary" size="sm" className="shrink-0" onClick={() => void synchronizeWithCloud()}>
          {cloud.status === "error" ? "Reintentar" : "Sincronizar"}
        </Button>
      ) : null}
    </section>
  );
}
