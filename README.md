# Watchélle

The two-person movie & show matchmaker. Each partner answers a short
preference form independently, Claude turns both answers (including free-text
mood) into a search brief, TMDB supplies a 30-title pool, both partners swipe
through it on their own phone, and a mutual right-swipe surfaces a match with
live Indian OTT links. Up to two refinement rounds run before falling back to
a "top 5, decide together" screen. Everything is saved so returning couples
get recommendations shaped by what they've actually enjoyed.

## Stack

Next.js (App Router, TypeScript) + Tailwind v4 + Supabase (Postgres +
Realtime) + Anthropic Claude + TMDB + RapidAPI's Streaming Availability API.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with whichever keys you have — see the comments in
`.env.example` for where to get each one. **You don't need any of them to run
the app locally**: every external integration has a narrow, clearly-labeled
dev fallback so the full create-session → swipe → match flow works out of the
box:

| Missing key | Fallback |
| --- | --- |
| Supabase | In-memory storage for the life of the `npm run dev` process (`lib/db/memory.ts`). Two browser tabs on the same machine can still play both partners. |
| `TMDB_API_KEY` | ~40 sample titles (`lib/fixtures/sampleTitles.ts`) instead of live TMDB results. |
| `ANTHROPIC_API_KEY` | A deterministic, rule-based brief/ranking instead of Claude's mood-aware curation. |
| `RAPIDAPI_KEY` | The match screen shows "add a key" instead of platform links. |

A banner at the top of the app tells you which of these are currently
unconfigured. Once you add real keys to `.env.local`, restart `next dev` and
the banner (and the fallback behind it) disappears on its own.

```bash
npm run dev
```

Open two browser tabs/windows to `http://localhost:3000` to play both
partners on one machine, or open it on your phone on the same network to
actually scan the QR code.

## Setting up Supabase for real

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy the project URL and the `anon` / `service_role` keys from
   Project Settings → API into `.env.local`.

## Project structure

```
app/                        pages + API route handlers (see PLAN in git history for the full map)
components/                 PreferenceForm, QRShare, SwipeDeck/SwipeCard, MatchReveal, FinalPickList, RatingForm
lib/
  db/                        Db interface + Supabase / in-memory implementations
  claude.ts                  brief generation + title curation (with rule-based fallback)
  tmdb.ts                    candidate discovery + detail enrichment (with sample-title fallback)
  streaming.ts                RapidAPI Streaming Availability wrapper
  reconcile.ts                deterministic merge of both partners' hard filters
  pool.ts                     ties tmdb.ts + claude.ts together for round 1 and round 2
  shuffle.ts                  seeded per-partner shuffle
  history.ts                   returning-couple taste summary for the brief prompt
supabase/schema.sql          tables, RLS policies, Realtime publication
```

## Design decisions worth knowing about

- **No login.** A couple's identity is a `couple_id` stored in Partner A's
  browser (`localStorage`). Partner B never needs one — they just join via
  the link/QR each session. Returning history only follows Partner A's
  device.
- **Hard filters (min rating, era, language, movies-vs-series) are merged in
  code**, deterministically — see `lib/reconcile.ts` — not left to the model.
  Claude's job is layered on top: turning free-text mood into genre/tone
  signal and ranking the final 30 (and later 5).
- **All writes happen server-side** through Next.js route handlers using the
  Supabase service-role key. The browser only ever reads, via Realtime, using
  the anon key.
