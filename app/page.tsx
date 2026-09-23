"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredCoupleId, setStoredCoupleId } from "@/lib/coupleId";

export default function Home() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage is only available post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReturning(Boolean(getStoredCoupleId()));
  }, []);

  async function startSession() {
    setStarting(true);
    setError(null);
    try {
      const coupleId = getStoredCoupleId();
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coupleId ? { coupleId } : {}),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStoredCoupleId(data.coupleId);
      router.push(`/session/${data.sessionId}/preferences?role=a`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start a session");
      setStarting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-7xl italic text-cream-100">Watchélle</h1>
        <p className="mt-3 text-cream-muted">
          The two-person movie &amp; show matchmaker. Swipe together, stop scrolling, and land on tonight&apos;s watch.
        </p>
      </div>

      {returning && (
        <p className="rounded-full bg-sage-500/15 px-4 py-2 text-sm text-sage-400">
          Welcome back — we’ll factor in what you two have enjoyed before.
        </p>
      )}

      <button
        onClick={startSession}
        disabled={starting}
        className="w-full rounded-full bg-pink-500 py-4 font-display text-lg font-semibold text-plum-950 disabled:opacity-40"
      >
        {starting ? "Starting…" : "Start tonight’s watch"}
      </button>

      {error && <p className="text-sm text-clay-500">{error}</p>}

      <p className="text-center text-xs text-cream-muted">
        You’ll answer a few questions, then send your partner a QR code or link to join.
      </p>
    </main>
  );
}
