"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PreferenceForm } from "@/components/PreferenceForm";
import type { Partner, Preferences } from "@/lib/types";

export default function PreferencesPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== "a" && role !== "b") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-cream-muted">
          This link is missing who’s answering. Ask whoever started tonight’s session for the invite link again.
        </p>
      </main>
    );
  }

  async function handleSubmit(prefs: Preferences) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${id}/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: role as Partner, prefs }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(role === "a" ? `/session/${id}/share` : `/session/${id}/waiting`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your answers");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
      <PreferenceForm
        partnerLabel={role === "a" ? "Partner A" : "Partner B"}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      {error && <p className="mt-4 text-center text-sm text-clay-500">{error}</p>}
    </main>
  );
}
