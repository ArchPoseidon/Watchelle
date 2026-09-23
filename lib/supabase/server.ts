import "server-only";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

/**
 * Server-only client using the service-role key. Bypasses RLS — every
 * mutation to `sessions`/`swipes` happens through this client, inside
 * Next.js route handlers, never in the browser.
 */
export const supabaseServer = createClient(
  url || "https://placeholder.supabase.co",
  serviceKey || "placeholder-service-key",
  { auth: { persistSession: false } }
);
