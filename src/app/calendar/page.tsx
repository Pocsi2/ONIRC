import { AppShell } from "@/components/app-shell";
import { DreamCalendar } from "@/components/dream-calendar";

export default function CalendarPage() {
  return (
    <AppShell>
      <Suspense fallback={<p className="pt-24 text-sm text-text-muted">Abriendo el calendario…</p>}>
        <DreamCalendar />
      </Suspense>
    </AppShell>
  );
}
import { Suspense } from "react";
