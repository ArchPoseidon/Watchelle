import "server-only";

import { isSupabaseConfigured } from "../supabase/server";
import { memoryDb } from "./memory";
import { SupabaseDb } from "./supabase";
import type { Db } from "./types";

export const usingMemoryDb = !isSupabaseConfigured;

export const db: Db = isSupabaseConfigured ? new SupabaseDb() : memoryDb;

export type { Db } from "./types";
