import { AppShell } from "@/components/app-shell";
import { DreamDetailRoute } from "@/components/dream-detail-route";
import { dreams, getDreamById } from "@/lib/dreams";

export function generateStaticParams() {
  return dreams.map((dream) => ({ id: dream.id }));
}

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dream = getDreamById(id);

  return (
    <AppShell>
      <DreamDetailRoute dreamId={id} initialDream={dream} />
    </AppShell>
  );
}
