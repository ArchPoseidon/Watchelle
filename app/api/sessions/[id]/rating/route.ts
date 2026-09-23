import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/rating">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const rating: number | undefined = body?.rating;
  const note: string | undefined = body?.note;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
  }

  const updated = await db.updateSession(id, { rating, rating_note: note ?? null, status: "rated" });
  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session: updated });
}
