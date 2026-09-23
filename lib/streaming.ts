import "server-only";

import type { MediaKind, StreamingOffer } from "./types";

export const isStreamingConfigured = Boolean(process.env.RAPIDAPI_KEY);

const HOST = process.env.RAPIDAPI_STREAMING_HOST || "streaming-availability.p.rapidapi.com";

/**
 * Wraps RapidAPI's "Streaming Availability" API (movieofthenight), scoped to
 * India (`country=in`). Only called for the matched title / final-5
 * shortlist, never the full 30-title pool, to conserve API quota.
 *
 * The exact endpoint/response shape is per the v4 docs as of this writing —
 * verify against https://www.movieofthenight.com/about/api once you have a
 * real RapidAPI key, since third-party API contracts can shift. Parsing
 * below is defensive: any unexpected shape just yields an empty list rather
 * than throwing, so a schema drift degrades gracefully instead of breaking
 * the match screen.
 */
export async function getIndianStreamingOffers(
  mediaKind: MediaKind,
  tmdbId: number
): Promise<StreamingOffer[]> {
  if (!isStreamingConfigured) return [];

  try {
    const res = await fetch(
      `https://${HOST}/shows/${mediaKind}/${tmdbId}?country=in`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": HOST,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const options = data?.streamingOptions?.in;
    if (!Array.isArray(options)) return [];

    return options
      .map((opt: Record<string, unknown>): StreamingOffer | null => {
        const service = opt.service as Record<string, unknown> | undefined;
        const name = typeof service?.name === "string" ? service.name : null;
        const link = typeof opt.link === "string" ? opt.link : null;
        const type = opt.type;
        if (!name || !link) return null;
        return {
          platform: name,
          logoUrl: null,
          link,
          type: type === "rent" || type === "buy" || type === "free" ? type : "subscription",
        };
      })
      .filter((o: StreamingOffer | null): o is StreamingOffer => o !== null);
  } catch {
    return [];
  }
}
