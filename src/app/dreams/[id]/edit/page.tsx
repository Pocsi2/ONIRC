import { AppShell } from "@/components/app-shell";
import { DreamEditRoute } from "@/components/dream-edit-route";
import { getDreamById } from "@/lib/dreams";

export default async function DreamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <DreamEditRoute dreamId={id} initialDream={getDreamById(id)} />
    </AppShell>
  );
}
