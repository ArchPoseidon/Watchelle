"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MatchReveal } from "@/components/MatchReveal";
import { useSession } from "@/lib/useSession";
import { useStreamingOffers } from "@/lib/useStreamingOffers";
import type { Title } from "@/lib/types";

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const role = useSearchParams().get("role") ?? "a";
  const { session, error } = useSession(id);

  const title: Title | undefined = session?.match_title_id
    ? Object.values(session.pool_history)
        .flat()
        .find((t) => t.id === session.match_title_id) ?? session.title_pool?.find((t) => t.id === session.match_title_id)
    : undefined;

  const { offers, loading: loadingOffers, configured: streamingConfigured } = useStreamingOffers(id, title);

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 items-center justify-center px-6 text-center text-cream-muted">
        {error}
      </main>
    );
  }

  if (!session || !title) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-600 border-t-sage-500" />
        <p className="text-cream-muted">Loading your match…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
      <MatchReveal title={title} offers={offers} loadingOffers={loadingOffers} streamingConfigured={streamingConfigured} />
      <Link
        href={`/session/${id}/rate?role=${role}`}
        className="text-sm text-cream-muted underline decoration-plum-600 underline-offset-4 hover:text-sage-400"
      >
        Already watched it? Rate it
      </Link>
    </main>
  );
}
