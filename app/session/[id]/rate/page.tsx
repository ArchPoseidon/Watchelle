"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { RatingForm } from "@/components/RatingForm";

export default function RatePage() {
  const { id } = useParams<{ id: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(rating: number, note: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, note }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your rating");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      {done ? (
        <div className="text-center">
          <h1 className="font-display text-3xl text-cream-100">Saved</h1>
          <p className="mt-2 text-cream-muted">We’ll use this next time you two can’t agree on what to watch.</p>
        </div>
      ) : (
        <RatingForm onSubmit={handleSubmit} submitting={submitting} />
      )}
      {error && <p className="text-sm text-clay-500">{error}</p>}
    </main>
  );
}
