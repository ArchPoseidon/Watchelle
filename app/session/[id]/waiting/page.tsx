"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/useSession";
import type { SessionStatus } from "@/lib/types";

const MESSAGES: Partial<Record<SessionStatus, string>> = {
  collecting_prefs: "Waiting for the other person to finish their answers…",
  generating_pool: "Claude is picking tonight's titles from both your answers…",
  round2_generating: "No match yet — Claude is refining the picks for round two…",
  no_match_final_pending: "Tallying your favorites…",
};

export default function WaitingPage() {
  const { id } = useParams<{ id: string }>();
  const role = useSearchParams().get("role") ?? "b";
  const router = useRouter();
  const { session, error } = useSession(id);

  useEffect(() => {
    if (!session) return;
    if (session.status === "swiping" || session.status === "round2_swiping" || session.status === "matched") {
      router.push(`/session/${id}/swipe?role=${role}`);
    } else if (session.status === "no_match_final") {
      router.push(`/session/${id}/final-pick?role=${role}`);
    }
  }, [session, id, role, router]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 items-center justify-center px-6 text-center text-cream-muted">
        {error}
      </main>
    );
  }

  const message = session ? MESSAGES[session.status] ?? "Getting things ready…" : "Getting things ready…";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-600 border-t-sage-500" />
      <p className="text-cream-muted">{message}</p>
    </main>
  );
}
