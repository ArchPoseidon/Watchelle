import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildHistoryContext } from "@/lib/history";
import { generateInitialPool } from "@/lib/pool";
import type { Partner, Preferences } from "@/lib/types";

export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/preferences">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const partner: Partner | undefined = body?.partner;
  const prefs: Preferences | undefined = body?.prefs;

  if (partner !== "a" && partner !== "b") {
    return NextResponse.json({ error: "partner must be 'a' or 'b'" }, { status: 400 });
  }
  if (!prefs) {
    return NextResponse.json({ error: "prefs is required" }, { status: 400 });
  }

  const patch = partner === "a" ? { partner_a_prefs: prefs } : { partner_b_prefs: prefs };
  const updated = await db.updateSession(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const bothIn = Boolean(updated.partner_a_prefs && updated.partner_b_prefs);
  if (!bothIn) {
    return NextResponse.json({ session: updated });
  }

  // Guard against both submit requests racing to trigger pool generation
  // twice: only the request that successfully flips collecting_prefs ->
  // generating_pool proceeds.
  const claimed = await db.updateSession(id, { status: "generating_pool" }, "collecting_prefs");
  if (!claimed) {
    return NextResponse.json({ session: updated });
  }

  try {
    const historyContext = await buildHistoryContext(updated.couple_id);
    const { brief, titles } = await generateInitialPool(
      updated.partner_a_prefs!,
      updated.partner_b_prefs!,
      historyContext
    );

    const finalSession = await db.updateSession(id, {
      brief,
      title_pool: titles,
      pool_history: { "1": titles },
      seen_title_ids: titles.map((t) => t.id),
      status: "swiping",
    });
    if (!finalSession) throw new Error("Session vanished during pool generation");
    return NextResponse.json({ session: finalSession });
  } catch (err) {
    // Roll back to collecting_prefs so a retry can regenerate the pool
    // instead of the session getting stuck in generating_pool forever.
    await db.updateSession(id, { status: "collecting_prefs" });
    const message = err instanceof Error ? err.message : "Pool generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
