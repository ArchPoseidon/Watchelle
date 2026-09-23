"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabaseBrowser } from "./supabase/client";
import type { SessionRow } from "./types";

export function useSession(sessionId: string) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setSession(data.session);
      })
      .catch(() => !cancelled && setError("Couldn't load this session."));

    if (!isSupabaseConfigured) {
      // Dev fallback (no Supabase project yet): poll instead of subscribing
      // to Postgres changes, so the multi-tab flow still works locally.
      const interval = setInterval(() => {
        fetch(`/api/sessions/${sessionId}`)
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled && data.session) setSession(data.session);
          })
          .catch(() => {});
      }, 1500);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    const channel = supabaseBrowser
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` },
        (payload) => {
          if (!cancelled) setSession(payload.new as SessionRow);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabaseBrowser.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, error, setSession };
}
