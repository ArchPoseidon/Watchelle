import "server-only";

import type { HardFilters } from "./reconcile";
import { SAMPLE_TITLES } from "./fixtures/sampleTitles";
import type { MediaKind, Title } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export const isTmdbConfigured = Boolean(process.env.TMDB_API_KEY);

// TMDB's genre id -> name mapping is effectively static; hardcoding it avoids
// two extra network calls (/genre/movie/list, /genre/tv/list) on every pool
// generation.
const GENRE_NAMES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War",
  37: "Western", 10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
  10768: "War & Politics",
};

interface RawResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  original_language: string;
  genre_ids: number[];
  poster_path: string | null;
}

export interface Candidate {
  id: string;
  tmdbId: number;
  mediaKind: MediaKind;
  name: string;
  year: number | null;
  rating: number;
  synopsis: string;
  genres: string[];
  posterUrl: string | null;
}

async function discoverOne(
  mediaKind: MediaKind,
  params: Record<string, string>
): Promise<RawResult[]> {
  const apiKey = process.env.TMDB_API_KEY!;
  const path = mediaKind === "movie" ? "discover/movie" : "discover/tv";
  const search = new URLSearchParams({
    api_key: apiKey,
    sort_by: "vote_average.desc",
    "vote_count.gte": "50",
    page: "1",
    ...params,
  });
  const res = await fetch(`${TMDB_BASE}/${path}?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`TMDB ${path} failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (data.results ?? []) as RawResult[];
}

function toCandidate(raw: RawResult, mediaKind: MediaKind): Candidate {
  const dateStr = mediaKind === "movie" ? raw.release_date : raw.first_air_date;
  const year = dateStr ? Number(dateStr.slice(0, 4)) : null;
  return {
    id: `${mediaKind}-${raw.id}`,
    tmdbId: raw.id,
    mediaKind,
    name: (mediaKind === "movie" ? raw.title : raw.name) ?? "Untitled",
    year,
    rating: raw.vote_average,
    synopsis: raw.overview || "No synopsis available.",
    genres: raw.genre_ids.map((g) => GENRE_NAMES[g]).filter(Boolean),
    posterUrl: raw.poster_path ? `${IMAGE_BASE}${raw.poster_path}` : null,
  };
}

/**
 * Fetches a broad candidate pool (~60-100 titles) matching the reconciled
 * hard filters. Handles TMDB's single-value discover params (language, one
 * date range) by issuing one request per (era range x language x content
 * type) combination and merging + deduping the results, capped so a couple
 * with wide-open filters doesn't trigger dozens of requests.
 */
export async function discoverCandidates(filters: HardFilters): Promise<Candidate[]> {
  if (!isTmdbConfigured) {
    return SAMPLE_TITLES.map((t) => ({
      id: t.id,
      tmdbId: t.tmdbId,
      mediaKind: t.mediaKind,
      name: t.name,
      year: t.year,
      rating: t.rating ?? 0,
      synopsis: t.synopsis,
      genres: t.genres,
      posterUrl: t.posterUrl,
    }));
  }

  const languages = filters.languageCodes.length > 0 ? filters.languageCodes : [undefined];
  const eras = filters.eraRanges.length > 0 ? filters.eraRanges : [{ from: 1900, to: 2026 }];

  const combos: Array<{ mediaKind: MediaKind; language?: string; era: { from: number; to: number } }> = [];
  for (const mediaKind of filters.contentTypes) {
    for (const era of eras.slice(0, 2)) {
      for (const language of languages.slice(0, 4)) {
        combos.push({ mediaKind, language, era });
      }
    }
  }

  const results = await Promise.allSettled(
    combos.map(({ mediaKind, language, era }) => {
      const dateField = mediaKind === "movie" ? "primary_release_date" : "first_air_date";
      const params: Record<string, string> = {
        "vote_average.gte": String(filters.minRating),
        [`${dateField}.gte`]: `${era.from}-01-01`,
        [`${dateField}.lte`]: `${era.to}-12-31`,
      };
      if (language) params.with_original_language = language;
      return discoverOne(mediaKind, params).then((raws) => raws.map((r) => toCandidate(r, mediaKind)));
    })
  );

  const merged = new Map<string, Candidate>();
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const c of r.value) merged.set(c.id, c);
    }
  }
  return [...merged.values()].slice(0, 100);
}

/**
 * Enriches the final selected titles (only the ~30 actually shown, not the
 * whole candidate pool) with runtime, which TMDB's discover endpoint omits.
 */
export async function enrichWithRuntime(selected: Candidate[]): Promise<Title[]> {
  if (!isTmdbConfigured) {
    return SAMPLE_TITLES.filter((t) => selected.some((s) => s.id === t.id));
  }

  const apiKey = process.env.TMDB_API_KEY!;
  const enriched = await Promise.allSettled(
    selected.map(async (c) => {
      const path = c.mediaKind === "movie" ? "movie" : "tv";
      const res = await fetch(`${TMDB_BASE}/${path}/${c.tmdbId}?api_key=${apiKey}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`TMDB detail failed for ${c.id}`);
      const data = await res.json();
      const runtimeMinutes: number | null =
        c.mediaKind === "movie"
          ? data.runtime ?? null
          : Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0
            ? data.episode_run_time[0]
            : null;
      const title: Title = {
        id: c.id,
        tmdbId: c.tmdbId,
        mediaKind: c.mediaKind,
        name: c.name,
        year: c.year,
        posterUrl: c.posterUrl,
        rating: c.rating,
        runtimeMinutes,
        synopsis: c.synopsis,
        genres: c.genres,
      };
      return title;
    })
  );

  return enriched
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((t): t is Title => t !== null);
}
