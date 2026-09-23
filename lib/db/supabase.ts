import "server-only";

import { supabaseServer } from "../supabase/server";
import type { Partner, SessionRow, SessionStatus } from "../types";
import type { CreateSessionInput, Db, RightSwipeRecord, SessionUpdate } from "./types";

export class SupabaseDb implements Db {
  async createCouple(): Promise<string> {
    const { data, error } = await supabaseServer.from("couples").insert({}).select("id").single();
    if (error) throw new Error(error.message);
    return data.id;
  }

  async createSession({ coupleId }: CreateSessionInput): Promise<string> {
    const { data, error } = await supabaseServer
      .from("sessions")
      .insert({ couple_id: coupleId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data.id;
  }

  async getSession(id: string): Promise<SessionRow | null> {
    const { data } = await supabaseServer.from("sessions").select("*").eq("id", id).single();
    return (data as SessionRow) ?? null;
  }

  async updateSession(id: string, patch: SessionUpdate, expectedStatus?: SessionStatus): Promise<SessionRow | null> {
    let query = supabaseServer.from("sessions").update(patch).eq("id", id);
    if (expectedStatus) query = query.eq("status", expectedStatus);
    const { data } = await query.select("*").single();
    return (data as SessionRow) ?? null;
  }

  async insertSwipe(sessionId: string, partner: Partner, round: number, titleId: string, direction: "right" | "left"): Promise<boolean> {
    const { error } = await supabaseServer
      .from("swipes")
      .insert({ session_id: sessionId, partner, round, title_id: titleId, direction });
    if (error && error.code !== "23505") throw new Error(error.message);
    return !error;
  }

  async countSwipes(sessionId: string, partner: Partner, round: number): Promise<number> {
    const { count } = await supabaseServer
      .from("swipes")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("partner", partner)
      .eq("round", round);
    return count ?? 0;
  }

  async hasRightSwipe(sessionId: string, partner: Partner, round: number, titleId: string): Promise<boolean> {
    const { data } = await supabaseServer
      .from("swipes")
      .select("id")
      .eq("session_id", sessionId)
      .eq("partner", partner)
      .eq("round", round)
      .eq("title_id", titleId)
      .eq("direction", "right")
      .maybeSingle();
    return Boolean(data);
  }

  async rightSwipedTitleIds(sessionId: string, partner: Partner, round: number): Promise<string[]> {
    const { data } = await supabaseServer
      .from("swipes")
      .select("title_id")
      .eq("session_id", sessionId)
      .eq("partner", partner)
      .eq("round", round)
      .eq("direction", "right");
    return (data ?? []).map((r) => r.title_id as string);
  }

  async allRightSwipes(sessionId: string): Promise<RightSwipeRecord[]> {
    const { data } = await supabaseServer
      .from("swipes")
      .select("title_id, partner, round")
      .eq("session_id", sessionId)
      .eq("direction", "right");
    return (data ?? []) as RightSwipeRecord[];
  }

  async ratedSessionsForCouple(coupleId: string): Promise<SessionRow[]> {
    const { data } = await supabaseServer
      .from("sessions")
      .select("*")
      .eq("couple_id", coupleId)
      .gte("rating", 4)
      .not("rating", "is", null);
    return (data as SessionRow[]) ?? [];
  }
}
