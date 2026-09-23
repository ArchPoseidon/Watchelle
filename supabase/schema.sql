-- Watchélle schema. Run this once in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples (id) on delete set null,
  status text not null default 'collecting_prefs',
  round int not null default 1,
  partner_a_prefs jsonb,
  partner_b_prefs jsonb,
  brief jsonb,
  title_pool jsonb,
  pool_history jsonb not null default '{}'::jsonb,
  seen_title_ids jsonb not null default '[]'::jsonb,
  match_title_id text,
  final_pick_title_id text,
  rating int,
  rating_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  partner text not null check (partner in ('a', 'b')),
  round int not null,
  title_id text not null,
  direction text not null check (direction in ('right', 'left')),
  created_at timestamptz not null default now(),
  unique (session_id, partner, round, title_id)
);

create index if not exists swipes_session_idx on swipes (session_id);
create index if not exists sessions_couple_idx on sessions (couple_id);

-- Keep updated_at current on any session change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sessions_set_updated_at on sessions;
create trigger sessions_set_updated_at
  before update on sessions
  for each row execute function set_updated_at();

-- Row Level Security: the browser only ever reads (via the anon key), for
-- Realtime status/match updates. All writes go through Next.js server routes
-- using the service-role key, which bypasses RLS, so no write policies exist.
alter table couples enable row level security;
alter table sessions enable row level security;
alter table swipes enable row level security;

create policy "sessions are readable by anyone with the id" on sessions
  for select using (true);

create policy "swipes are readable by anyone with the session id" on swipes
  for select using (true);

-- Enable Realtime for live sync between the two partners' devices.
alter publication supabase_realtime add table sessions;
