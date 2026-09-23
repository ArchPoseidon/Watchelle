import { NextResponse } from "next/server";
import { getIndianStreamingOffers, isStreamingConfigured } from "@/lib/streaming";
import type { MediaKind } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mediaKind = url.searchParams.get("mediaKind") as MediaKind | null;
  const tmdbId = url.searchParams.get("tmdbId");

  if ((mediaKind !== "movie" && mediaKind !== "tv") || !tmdbId) {
    return NextResponse.json({ error: "mediaKind and tmdbId are required" }, { status: 400 });
  }

  if (!isStreamingConfigured) {
    return NextResponse.json({ offers: [], configured: false });
  }

  const offers = await getIndianStreamingOffers(mediaKind, Number(tmdbId));
  return NextResponse.json({ offers, configured: true });
}
