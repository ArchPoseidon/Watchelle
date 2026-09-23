import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RightSwipeRecord } from "@/lib/db/types";
import { generateRound2Pool } from "@/lib/pool";
import type { Partner, SessionRow, SwipeDirection, Title } from "@/lib/types";

function computeTopFinalists(session: SessionRow, allSwipes: RightSwipeRecord[]) {
  const partnersSeen = new Map<string, Set<Partner>>();
  for (const s of allSwipes) {
    const seen = partnersSeen.get(s.title_id) ?? new Set<Partner>();
    seen.add(s.partner);
    partnersSeen.set(s.title_id, seen);
  }

  const allTitles = Object.values(session.pool_history).flat();
  const byId = new Map(allTitles.map((t) => [t.id, t]));

  return [...partnersSeen.entries()]
    .map(([titleId, partners]) => ({ title: byId.get(titleId), score: partners.size }))
    .filter((x): x is { title: Title; score: number } => Boolean(x.title))
    .sort((a, b) => b.score - a.score || (b.title.rating ?? 0) - (a.title.rating ?? 0))
    .slice(0, 5)
    .map((x) => x.title);
}

export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/swipe">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const partner: Partner | undefined = body?.partner;
  const titleId: string | undefined = body?.titleId;
  const direction: SwipeDirection | undefined = body?.direction;

  if (partner !== "a" && partner !== "b") {
    return NextResponse.json({ error: "partner must be 'a' or 'b'" }, { status: 400 });
  }
  if (!titleId || (direction !== "right" && direction !== "left")) {
    return NextResponse.json({ error: "titleId and direction are required" }, { status: 400 });
  }

  const s = await db.getSession(id);
  if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (s.status !== "swiping" && s.status !== "round2_swiping") {
    return NextResponse.json({ session: s });
  }

  const round = s.round;
  await db.insertSwipe(id, partner, round, titleId, direction);

  if (direction === "right") {
    const other: Partner = partner === "a" ? "b" : "a";
    const otherHasRight = await db.hasRightSwipe(id, other, round, titleId);
    if (otherHasRight) {
      const matchedSession = await db.updateSession(id, { status: "matched", match_title_id: titleId }, s.status);
      return NextResponse.json({ session: matchedSession ?? s, matched: true });
    }
  }

  const poolSize = s.title_pool?.length ?? 0;
  const [countA, countB] = await Promise.all([db.countSwipes(id, "a", round), db.countSwipes(id, "b", round)]);
  const bothExhausted = poolSize > 0 && countA >= poolSize && countB >= poolSize;

  if (!bothExhausted) {
    return NextResponse.json({ session: s, matched: false });
  }

  const generatingStatus = round === 1 ? "round2_generating" : "no_match_final_pending";
  const claimed = await db.updateSession(id, { status: generatingStatus }, s.status);
  if (!claimed) {
    // Another request (the other partner's last swipe) already claimed the transition.
    return NextResponse.json({ session: s, matched: false });
  }

  try {
    if (round === 1) {
      const pool = s.title_pool ?? [];
      const [rightAIds, rightBIds] = await Promise.all([
        db.rightSwipedTitleIds(id, "a", 1),
        db.rightSwipedTitleIds(id, "b", 1),
      ]);
      const rightA = pool.filter((t) => rightAIds.includes(t.id));
      const rightB = pool.filter((t) => rightBIds.includes(t.id));

      const { brief, titles } = await generateRound2Pool(
        s.brief!,
        s.partner_a_prefs!,
        s.partner_b_prefs!,
        rightA,
        rightB,
        s.seen_title_ids
      );
      const updatedSession = await db.updateSession(id, {
        round: 2,
        brief,
        title_pool: titles,
        pool_history: { ...s.pool_history, "2": titles },
        seen_title_ids: [...s.seen_title_ids, ...titles.map((t) => t.id)],
        status: "round2_swiping",
      });
      if (!updatedSession) throw new Error("Session vanished during round 2 generation");
      return NextResponse.json({ session: updatedSession, matched: false, roundAdvanced: true });
    } else {
      const allSwipes = await db.allRightSwipes(id);
      const finalists = computeTopFinalists(s, allSwipes);
      const updatedSession = await db.updateSession(id, { status: "no_match_final", title_pool: finalists });
      if (!updatedSession) throw new Error("Session vanished computing finalists");
      return NextResponse.json({ session: updatedSession, matched: false, finalRound: true });
    }
  } catch (err) {
    await db.updateSession(id, { status: s.status });
    const message = err instanceof Error ? err.message : "Round transition failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
