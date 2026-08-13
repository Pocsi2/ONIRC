import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DreamDetail } from "@/components/dream-detail";
import { dreams, getDreamById, visualSavedDream } from "@/lib/dreams";

export function generateStaticParams() {
  return [...dreams, visualSavedDream].map((dream) => ({ id: dream.id }));
}

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dream = getDreamById(id);

  if (!dream) {
    notFound();
  }

  return (
    <AppShell>
      <DreamDetail dream={dream} />
    </AppShell>
  );
}
