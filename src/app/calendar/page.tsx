import { AppShell } from "@/components/app-shell";
import { DreamCalendar } from "@/components/dream-calendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ kept?: string }>;
}) {
  const params = await searchParams;

  return (
    <AppShell>
      <DreamCalendar revealKeptDream={params?.kept === "white-garden"} />
    </AppShell>
  );
}
