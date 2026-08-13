"use client";

import { PageTransition } from "@/components/motion/page-transition";
import { Button } from "@/components/ui/button";
import { ViewTransitionLink } from "@/components/view-transition-link";
import type { Dream } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { DreamDetail } from "@/components/dream-detail";

export function DreamDetailRoute({ dreamId, initialDream }: { dreamId: string; initialDream?: Dream }) {
  const { getDream, isReady } = useDreamStore();
  const dream = getDream(dreamId) ?? initialDream;

  if (!isReady) return null;
  if (!dream) {
    return (
      <PageTransition className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-6xl">Memory not found.</h1>
        <p className="mt-5 text-text-secondary">This point in time is no longer available.</p>
        <Button asChild className="mt-8"><ViewTransitionLink href="/calendar">Return to calendar</ViewTransitionLink></Button>
      </PageTransition>
    );
  }

  return <DreamDetail dream={dream} />;
}
