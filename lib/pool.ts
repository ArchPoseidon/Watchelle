import "server-only";

import { curateTitles, generateInitialBrief, refineBriefForRound2 } from "./claude";
import { discoverCandidates, enrichWithRuntime } from "./tmdb";
import { reconcileHardFilters } from "./reconcile";
import type { Preferences, SearchBrief, Title } from "./types";

export const POOL_SIZE = 30;

export async function generateInitialPool(
  prefsA: Preferences,
  prefsB: Preferences,
  historyContext?: string
): Promise<{ brief: SearchBrief; titles: Title[] }> {
  const hardFilters = reconcileHardFilters(prefsA, prefsB);
  const brief = await generateInitialBrief(prefsA, prefsB, hardFilters, historyContext);
  const candidates = await discoverCandidates(hardFilters);
  const selected = await curateTitles(candidates, brief, prefsA.moodText, prefsB.moodText, POOL_SIZE);
  const titles = await enrichWithRuntime(selected);
  return { brief, titles };
}

export async function generateRound2Pool(
  previousBrief: SearchBrief,
  prefsA: Preferences,
  prefsB: Preferences,
  rightSwipedByA: Title[],
  rightSwipedByB: Title[],
  seenTitleIds: string[]
): Promise<{ brief: SearchBrief; titles: Title[] }> {
  const brief = await refineBriefForRound2(previousBrief, rightSwipedByA, rightSwipedByB);
  const candidates = (await discoverCandidates(brief.hardFilters)).filter(
    (c) => !seenTitleIds.includes(c.id)
  );
  const selected = await curateTitles(candidates, brief, prefsA.moodText, prefsB.moodText, POOL_SIZE);
  const titles = await enrichWithRuntime(selected);
  return { brief, titles };
}
