"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRShare } from "@/components/QRShare";
import { useSession } from "@/lib/useSession";

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session, error } = useSession(id);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);

  useEffect(() => {
    // window.location is only available post-mount; this intentionally
    // renders once without it, then fills in the real join link.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJoinUrl(`${window.location.origin}/session/${id}/preferences?role=b`);
  }, [id]);

  useEffect(() => {
    if (!session) return;
    if (session.status === "swiping" || session.status === "matched") {
      router.push(`/session/${id}/swipe?role=a`);
    } else if (session.status !== "collecting_prefs" && session.status !== "generating_pool") {
      router.push(`/session/${id}/waiting?role=a`);
    }
  }, [session, id, router]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 items-center justify-center px-6 text-center text-cream-muted">
        {error}
      </main>
    );
  }

  const waitingOnPartner = !session?.partner_b_prefs;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <div>
        <h1 className="font-display text-3xl text-cream-100">
          {waitingOnPartner ? "Bring your partner in" : "Almost there"}
        </h1>
        <p className="mt-2 text-cream-muted">
          {waitingOnPartner
            ? "Scan this together, or send the link — they'll answer independently."
            : "Claude is picking tonight's titles from both your answers…"}
        </p>
      </div>

      {waitingOnPartner && joinUrl ? (
        <QRShare joinUrl={joinUrl} />
      ) : (
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-plum-600 border-t-sage-500" />
      )}
    </main>
  );
}
