import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const requestedCoupleId: string | undefined = body?.coupleId;

  try {
    const coupleId = requestedCoupleId ?? (await db.createCouple());
    const sessionId = await db.createSession({ coupleId });
    return NextResponse.json({ sessionId, coupleId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't create session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
