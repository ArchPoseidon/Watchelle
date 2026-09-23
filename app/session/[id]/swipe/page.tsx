"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SwipeDeck } from "@/components/SwipeDeck";
import { seededShuffle } from "@/lib/shuffle";
import { useSession } from "@/lib/useSession";
import type { Partner, Title } from "@/lib/types";

export default function SwipePage() {
  const { id } = useParams<{ id: string }>();
  const role = (useSearchParams().get("role") ?? "a") as Partner;
  const router = useRouter();
  const { session, error, setSession } = useSession(id);

  const shuffled = session?.title_pool
    ? seededShuffle(session.title_pool, `${id}-${role}-round${session.round}`)
    : [];

  useEffect(() => {
    if (!session) return;
    if (session.status === "matched") router.push(`/session/${id}/match?role=${role}`);
    else if (session.status === "no_match_final") router.push(`/session/${id}/final-pick?role=${role}`);
  }, [session, id, role, router]);

  async function handleSwipe(title: Title, direction: "right" | "left") {
    try {
      const res = await fetch(`/api/sessions/${id}/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: role, titleId: title.id, direction }),
      });
      const data = await res.json();
      if (data.session) setSession(data.session);
    } catch {
      // best-effort: the poll/realtime subscription will reconcile state either way
    }
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 items-center justify-center px-6 text-center text-cream-muted">
        {error}
      </main>
    );
  }

  if (!session || shuffled.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-600 border-t-sage-500" />
        <p className="text-cream-muted">Loading tonight’s picks…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-4 py-6">
      <div className="mb-4 text-center">
        <p className="text-xs uppercase tracking-wide text-sage-500">
          {session.round === 1 ? "Round one" : "Round two — refined for you"}
        </p>
      </div>
      <div className="flex flex-1 flex-col" style={{ minHeight: 520 }}>
        <SwipeDeck key={session.round} titles={shuffled} onSwipe={handleSwipe} onExhausted={() => {}} />
      </div>
    </main>
  );
}
