"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FinalPickList } from "@/components/FinalPickList";
import { MatchReveal } from "@/components/MatchReveal";
import { useSession } from "@/lib/useSession";
import { useStreamingOffers } from "@/lib/useStreamingOffers";
import type { Title } from "@/lib/types";

export default function FinalPickPage() {
  const { id } = useParams<{ id: string }>();
  const role = useSearchParams().get("role") ?? "a";
  const { session, error, setSession } = useSession(id);
  const [picking, setPicking] = useState(false);

  const finalTitle: Title | undefined = session?.final_pick_title_id
    ? session.title_pool?.find((t) => t.id === session.final_pick_title_id)
    : undefined;

  const { offers, loading: loadingOffers, configured: streamingConfigured } = useStreamingOffers(id, finalTitle);

  async function handlePick(title: Title) {
    setPicking(true);
    try {
      const res = await fetch(`/api/sessions/${id}/final-pick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId: title.id }),
      });
      const data = await res.json();
      if (data.session) setSession(data.session);
    } finally {
      setPicking(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 items-center justify-center px-6 text-center text-cream-muted">
        {error}
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-600 border-t-sage-500" />
        <p className="text-cream-muted">Tallying favorites…</p>
      </main>
    );
  }

  if (finalTitle) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
        <MatchReveal
          title={finalTitle}
          offers={offers}
          loadingOffers={loadingOffers}
          streamingConfigured={streamingConfigured}
        />
        <Link
          href={`/session/${id}/rate?role=${role}`}
          className="text-sm text-cream-muted underline decoration-plum-600 underline-offset-4 hover:text-sage-400"
        >
          Already watched it? Rate it
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
      <FinalPickList titles={session.title_pool ?? []} onPick={handlePick} picking={picking} />
    </main>
  );
}
