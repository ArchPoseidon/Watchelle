export type Mood = "light_fun" | "intense_gripping" | "scary" | "romantic" | "other";

export type Language = "hindi" | "english" | "tamil" | "telugu" | "kannada" | "any";

export type ContentType = "movies_only" | "include_series";

export type MinRating = 6 | 7 | 8 | 9;

export type Era = "any" | "classic" | "2000_2020" | "recent";

export type Partner = "a" | "b";

export interface Preferences {
  moods: Mood[];
  moodText: string;
  languages: Language[];
  contentType: ContentType;
  minRating: MinRating;
  eras: Era[];
}

export type MediaKind = "movie" | "tv";

export interface Title {
  id: string; // `${mediaKind}-${tmdbId}`
  tmdbId: number;
  mediaKind: MediaKind;
  name: string;
  year: number | null;
  posterUrl: string | null;
  rating: number | null;
  runtimeMinutes: number | null;
  synopsis: string;
  genres: string[];
}

export interface SearchBrief {
  hardFilters: {
    minRating: number;
    eraRanges: Array<{ from: number; to: number }>;
    contentTypes: MediaKind[];
    languageCodes: string[]; // TMDB ISO 639-1 codes, empty = no language restriction
  };
  toneKeywords: string[];
  genreHints: string[];
  avoid: string[];
  narrative: string; // short human-readable description of what we're looking for
}

export type SessionStatus =
  | "collecting_prefs"
  | "generating_pool"
  | "swiping"
  | "round2_generating"
  | "round2_swiping"
  | "matched"
  | "no_match_final_pending"
  | "no_match_final"
  | "rated";

export interface SessionRow {
  id: string;
  couple_id: string | null;
  status: SessionStatus;
  round: number;
  partner_a_prefs: Preferences | null;
  partner_b_prefs: Preferences | null;
  brief: SearchBrief | null;
  title_pool: Title[] | null;
  pool_history: Record<string, Title[]>;
  seen_title_ids: string[];
  match_title_id: string | null;
  final_pick_title_id: string | null;
  rating: number | null;
  rating_note: string | null;
  created_at: string;
  updated_at: string;
}

export type SwipeDirection = "right" | "left";

export interface SwipeRow {
  id: string;
  session_id: string;
  partner: Partner;
  round: number;
  title_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface StreamingOffer {
  platform: string;
  logoUrl: string | null;
  link: string;
  type: "subscription" | "rent" | "buy" | "free";
}
