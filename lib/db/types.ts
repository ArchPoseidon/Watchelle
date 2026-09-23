import type { Partner, SearchBrief, SessionRow, SessionStatus, Title } from "../types";

export interface CreateSessionInput {
  coupleId: string;
}

export interface SessionUpdate {
  couple_id?: string | null;
  status?: SessionStatus;
  round?: number;
  partner_a_prefs?: SessionRow["partner_a_prefs"];
  partner_b_prefs?: SessionRow["partner_b_prefs"];
  brief?: SearchBrief;
  title_pool?: Title[];
  pool_history?: Record<string, Title[]>;
  seen_title_ids?: string[];
  match_title_id?: string | null;
  final_pick_title_id?: string | null;
  rating?: number | null;
  rating_note?: string | null;
}

export interface RightSwipeRecord {
  title_id: string;
  partner: Partner;
  round: number;
}

/**
 * Data-access boundary implemented twice: once against Supabase (real,
 * persistent, multi-device) and once in-memory (dev-only, single process),
 * so the full session/swipe/match flow can be exercised locally before the
 * user has a Supabase project. All API routes go through this, never the
 * Supabase client directly.
 */
export interface Db {
  createCouple(): Promise<string>;
  createSession(input: CreateSessionInput): Promise<string>;
  getSession(id: string): Promise<SessionRow | null>;
  /** If `expectedStatus` is given, the update only applies when the row's current status matches (optimistic guard against race conditions). Returns null if the guard fails or the row doesn't exist. */
  updateSession(id: string, patch: SessionUpdate, expectedStatus?: SessionStatus): Promise<SessionRow | null>;
  /** Returns false if this exact swipe already existed (idempotent retry). */
  insertSwipe(sessionId: string, partner: Partner, round: number, titleId: string, direction: "right" | "left"): Promise<boolean>;
  countSwipes(sessionId: string, partner: Partner, round: number): Promise<number>;
  hasRightSwipe(sessionId: string, partner: Partner, round: number, titleId: string): Promise<boolean>;
  rightSwipedTitleIds(sessionId: string, partner: Partner, round: number): Promise<string[]>;
  allRightSwipes(sessionId: string): Promise<RightSwipeRecord[]>;
  ratedSessionsForCouple(coupleId: string): Promise<SessionRow[]>;
}
