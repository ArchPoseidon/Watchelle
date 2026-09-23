"use client";

import { useState } from "react";

export function RatingForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (rating: number, note: string) => void;
  submitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating > 0) onSubmit(rating, note);
      }}
      className="w-full max-w-sm space-y-6 text-center"
    >
      <div>
        <h1 className="font-display text-3xl text-cream-100">How was it?</h1>
        <p className="mt-1 text-cream-muted">Rate it together — this shapes what we suggest next time.</p>
      </div>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`text-4xl transition-transform ${n <= rating ? "scale-110 text-gold-500" : "text-plum-600"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any notes for next time? (optional)"
        rows={3}
        className="w-full rounded-2xl border border-plum-600 bg-plum-800/50 p-4 text-cream-100 placeholder:text-cream-muted focus:border-sage-500 focus:outline-none"
      />

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full rounded-full bg-gold-500 py-4 font-display text-lg font-semibold text-plum-950 disabled:opacity-40"
      >
        {submitting ? "Saving…" : "Save rating"}
      </button>
    </form>
  );
}
