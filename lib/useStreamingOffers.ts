"use client";

import { useEffect, useState } from "react";
import type { StreamingOffer, Title } from "./types";

export function useStreamingOffers(sessionId: string, title: Title | undefined) {
  const [offers, setOffers] = useState<StreamingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (!title) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets loading when `title` changes (e.g. round 2's match), before the fetch below settles it
    setLoading(true);
    fetch(`/api/sessions/${sessionId}/availability?mediaKind=${title.mediaKind}&tmdbId=${title.tmdbId}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers ?? []);
        setConfigured(data.configured ?? true);
      })
      .finally(() => setLoading(false));
  }, [sessionId, title]);

  return { offers, loading, configured };
}
