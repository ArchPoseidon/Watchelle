import "server-only";

import { db } from "./db";
import type { Title } from "./types";

/**
 * Builds a compact summary of a returning couple's past enjoyed titles, fed
 * into brief generation as extra context. Only sessions the couple actually
 * rated 4+ count as a positive signal — a match with no rating yet, or a
 * low rating, says nothing reliable about taste.
 */
export async function buildHistoryContext(coupleId: string | null): Promise<string | undefined> {
  if (!coupleId) return undefined;

  const rated = await db.ratedSessionsForCouple(coupleId);
  if (rated.length === 0) return undefined;

  const enjoyed: Title[] = [];
  for (const row of rated) {
    const pickedId = row.match_title_id ?? row.final_pick_title_id;
    if (!pickedId || !row.title_pool) continue;
    const title = row.title_pool.find((t) => t.id === pickedId);
    if (title) enjoyed.push(title);
  }

  if (enjoyed.length === 0) return undefined;

  const genreCounts = new Map<string, number>();
  for (const t of enjoyed) {
    for (const g of t.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
  }
  const topGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);

  const names = enjoyed.slice(0, 8).map((t) => t.name);
  return `Previously rated 4+ stars together: ${names.join(", ")}.${
    topGenres.length > 0 ? ` Recurring genres they enjoy: ${topGenres.join(", ")}.` : ""
  }`;
}
