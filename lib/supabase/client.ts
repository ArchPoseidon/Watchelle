"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Falls back to harmless placeholder values when unconfigured so the client
// can still be constructed for local UI work; callers must check
// `isSupabaseConfigured` before relying on live data.
export const supabaseBrowser = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
