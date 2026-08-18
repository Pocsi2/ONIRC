"use client";

import { CloudOff, CloudUpload, LoaderCircle } from "lucide-react";
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
  const hasError = cloud.status === "error";
  const Icon = hasError ? CloudOff : isSyncing ? LoaderCircle : CloudUpload;
  const statusMessage = hasError
    ? "No se pudo sincronizar. Tus sueños siguen guardados en este dispositivo."
    : isSyncing
      ? "Sincronizando tus sueños…"
      : "Sincroniza tus sueños entre tus dispositivos.";

  return (
    <section className="mt-5 flex max-w-xl items-center justify-between gap-3 border-t border-[var(--border-quiet)] pt-4" aria-label="Copia privada" aria-busy={isSyncing}>
      <div className="flex min-w-0 items-start gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isSyncing ? "animate-spin motion-reduce:animate-none" : ""} ${hasError ? "text-memory-accessible" : "text-text-secondary"}`} aria-hidden="true" />
        <p role="status" aria-live="polite" aria-atomic="true" className="text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">{statusMessage}</p>
      </div>
      {!isSyncing ? (
        <Button variant="secondary" size="sm" className="min-h-11 shrink-0 px-3 sm:px-4" onClick={() => void synchronizeWithCloud()}>
          {hasError ? "Reintentar" : "Sincronizar"}
        </Button>
      ) : null}
    </section>
  );
}
