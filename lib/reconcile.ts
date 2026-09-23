import type { Era, Language, MediaKind, Preferences } from "./types";

const LANGUAGE_CODES: Record<Exclude<Language, "any">, string> = {
  hindi: "hi",
  english: "en",
  tamil: "ta",
  telugu: "te",
  kannada: "kn",
};

const ERA_RANGES: Record<Exclude<Era, "any">, { from: number; to: number }> = {
  classic: { from: 1900, to: 1999 },
  "2000_2020": { from: 2000, to: 2020 },
  recent: { from: 2021, to: 2026 },
};

export interface HardFilters {
  minRating: number;
  eraRanges: Array<{ from: number; to: number }>;
  contentTypes: MediaKind[];
  languageCodes: string[];
}

function languageCodesFor(prefs: Preferences): string[] {
  if (prefs.languages.includes("any") || prefs.languages.length === 0) return [];
  return prefs.languages.map((l) => LANGUAGE_CODES[l as Exclude<Language, "any">]);
}

function eraRangesFor(prefs: Preferences): Array<{ from: number; to: number }> {
  if (prefs.eras.includes("any") || prefs.eras.length === 0) {
    return [{ from: 1900, to: 2026 }];
  }
  return prefs.eras.map((e) => ERA_RANGES[e as Exclude<Era, "any">]);
}

/**
 * Merges two independently-submitted preference forms into one set of hard
 * filters a title must satisfy for BOTH partners. Deterministic and testable
 * on purpose — Claude's job is the fuzzy mood/genre layer on top of this,
 * not reconciling structured fields.
 */
export function reconcileHardFilters(a: Preferences, b: Preferences): HardFilters {
  const minRating = Math.max(a.minRating, b.minRating);

  const contentTypes: MediaKind[] =
    a.contentType === "movies_only" && b.contentType === "movies_only"
      ? ["movie"]
      : ["movie", "tv"];

  const langsA = languageCodesFor(a);
  const langsB = languageCodesFor(b);
  let languageCodes: string[];
  if (langsA.length === 0 || langsB.length === 0) {
    // Either partner selected "Any" — no language restriction.
    languageCodes = [];
  } else {
    const intersection = langsA.filter((code) => langsB.includes(code));
    languageCodes = intersection.length > 0 ? intersection : [...new Set([...langsA, ...langsB])];
  }

  const eraRanges = mergeRanges([...eraRangesFor(a), ...eraRangesFor(b)]);

  return { minRating, contentTypes, languageCodes, eraRanges };
}

function mergeRanges(ranges: Array<{ from: number; to: number }>) {
  const sorted = [...ranges].sort((x, y) => x.from - y.from);
  const merged: Array<{ from: number; to: number }> = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.from <= last.to + 1) {
      last.to = Math.max(last.to, range.to);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
