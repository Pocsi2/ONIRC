"use client";

import { useDreamStore } from "@/lib/dreams-store";
import { cn } from "@/lib/utils";

export function PersistenceStatus({ className }: { className?: string }) {
  const { persistence } = useDreamStore();
  if (!persistence.message && persistence.mode === "browser") return null;

  return (
    <p role="status" aria-live="polite" className={cn("text-xs leading-5 text-text-muted", className)}>
      {persistence.message ?? "Memories are kept in this browser."}
    </p>
  );
}
