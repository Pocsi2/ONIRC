import { AppShell } from "@/components/app-shell";
import { DreamCalendar } from "@/components/dream-calendar";

export default function CalendarPage() {
  const initialMonthKey = new Date().toISOString().slice(0, 7);

  return (
    <AppShell>
      <DreamCalendar initialMonthKey={initialMonthKey} />
    </AppShell>
  );
}
