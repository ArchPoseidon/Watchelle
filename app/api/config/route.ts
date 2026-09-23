import { NextResponse } from "next/server";
import { usingMemoryDb } from "@/lib/db";
import { isClaudeConfigured } from "@/lib/claude";
import { isStreamingConfigured } from "@/lib/streaming";
import { isTmdbConfigured } from "@/lib/tmdb";

// Exposes only booleans — never the keys themselves — so the client can show
// a "running in dev/sample mode" banner while any integration is unconfigured.
export async function GET() {
  return NextResponse.json({
    supabaseConfigured: !usingMemoryDb,
    tmdbConfigured: isTmdbConfigured,
    claudeConfigured: isClaudeConfigured,
    streamingConfigured: isStreamingConfigured,
  });
}
