import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/final-pick">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const titleId: string | undefined = body?.titleId;
  if (!titleId) return NextResponse.json({ error: "titleId is required" }, { status: 400 });

  const updated = await db.updateSession(id, { final_pick_title_id: titleId }, "no_match_final");
  if (!updated) {
    return NextResponse.json({ error: "Session not in final-pick state" }, { status: 409 });
  }
  return NextResponse.json({ session: updated });
}
