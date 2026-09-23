import "server-only";

import { randomUUID } from "crypto";
import type { Partner, SessionRow } from "../types";
import type { CreateSessionInput, Db, RightSwipeRecord, SessionUpdate } from "./types";

interface SwipeRecord {
  session_id: string;
  partner: Partner;
  round: number;
  title_id: string;
  direction: "right" | "left";
}

/**
 * Dev-only fallback so the full flow works before a Supabase project
 * exists. Lives in module-level memory for the life of the `next dev`
 * process: fine for local testing across browser tabs, wiped on restart,
 * never used when SUPABASE_SERVICE_ROLE_KEY is set.
 */
class MemoryDb implements Db {
  private couples = new Map<string, true>();
  private sessions = new Map<string, SessionRow>();
  private swipes: SwipeRecord[] = [];

  async createCouple(): Promise<string> {
    const id = randomUUID();
    this.couples.set(id, true);
    return id;
  }

  async createSession({ coupleId }: CreateSessionInput): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();
    this.sessions.set(id, {
      id,
      couple_id: coupleId,
      status: "collecting_prefs",
      round: 1,
      partner_a_prefs: null,
      partner_b_prefs: null,
      brief: null,
      title_pool: null,
      pool_history: {},
      seen_title_ids: [],
      match_title_id: null,
      final_pick_title_id: null,
      rating: null,
      rating_note: null,
      created_at: now,
      updated_at: now,
    });
    return id;
  }

  async getSession(id: string): Promise<SessionRow | null> {
    return this.sessions.get(id) ?? null;
  }

  async updateSession(id: string, patch: SessionUpdate, expectedStatus?: SessionRow["status"]): Promise<SessionRow | null> {
    const existing = this.sessions.get(id);
    if (!existing) return null;
    if (expectedStatus && existing.status !== expectedStatus) return null;
    const updated: SessionRow = { ...existing, ...patch, updated_at: new Date().toISOString() };
    this.sessions.set(id, updated);
    return updated;
  }

  async insertSwipe(sessionId: string, partner: Partner, round: number, titleId: string, direction: "right" | "left"): Promise<boolean> {
    const exists = this.swipes.some(
      (s) => s.session_id === sessionId && s.partner === partner && s.round === round && s.title_id === titleId
    );
    if (exists) return false;
    this.swipes.push({ session_id: sessionId, partner, round, title_id: titleId, direction });
    return true;
  }

  async countSwipes(sessionId: string, partner: Partner, round: number): Promise<number> {
    return this.swipes.filter((s) => s.session_id === sessionId && s.partner === partner && s.round === round).length;
  }

  async hasRightSwipe(sessionId: string, partner: Partner, round: number, titleId: string): Promise<boolean> {
    return this.swipes.some(
      (s) =>
        s.session_id === sessionId &&
        s.partner === partner &&
        s.round === round &&
        s.title_id === titleId &&
        s.direction === "right"
    );
  }

  async rightSwipedTitleIds(sessionId: string, partner: Partner, round: number): Promise<string[]> {
    return this.swipes
      .filter((s) => s.session_id === sessionId && s.partner === partner && s.round === round && s.direction === "right")
      .map((s) => s.title_id);
  }

  async allRightSwipes(sessionId: string): Promise<RightSwipeRecord[]> {
    return this.swipes
      .filter((s) => s.session_id === sessionId && s.direction === "right")
      .map(({ title_id, partner, round }) => ({ title_id, partner, round }));
  }

  async ratedSessionsForCouple(coupleId: string): Promise<SessionRow[]> {
    return [...this.sessions.values()].filter((s) => s.couple_id === coupleId && (s.rating ?? 0) >= 4);
  }
}

// A module-level singleton survives across requests within one `next dev`
// process (Next.js route handlers are re-imported per request but the
// module cache persists), which is exactly the lifetime this fallback needs.
export const memoryDb = new MemoryDb();
