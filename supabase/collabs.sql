-- Run this in Supabase SQL Editor
-- Replaces the jobs/applications flow with the mobile app's direct-hire model.

-- ── Rate cards: one per creator, defines their pricing menu ──────────────────
create table if not exists rate_cards (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null unique references auth.users(id) on delete cascade,
  content_types   jsonb not null default '[]'::jsonb,
  durations       jsonb not null default '[]'::jsonb,
  platforms       jsonb not null default '[]'::jsonb,
  addons          jsonb not null default '[]'::jsonb,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table rate_cards enable row level security;

create policy "Anyone can read public rate cards"
  on rate_cards for select
  using (is_public = true or auth.uid() = creator_id);

create policy "Creators can manage their own rate card"
  on rate_cards for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

create or replace function touch_rate_card_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists on_rate_card_update on rate_cards;
create trigger on_rate_card_update
  before update on rate_cards
  for each row execute procedure touch_rate_card_updated_at();

-- ── Collabs: the canonical direct-hire transaction record ────────────────────
create table if not exists collabs (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references auth.users(id) on delete cascade,
  creator_id          uuid not null references auth.users(id) on delete cascade,

  content_type        text not null,
  duration_label       text not null,
  duration_price       numeric not null default 0,
  platforms             jsonb not null default '[]'::jsonb,
  addons                jsonb not null default '[]'::jsonb,

  production_cost      numeric not null default 0,
  posting_cost          numeric not null default 0,
  addons_cost           numeric not null default 0,
  total_amount          numeric not null default 0,
  platform_fee          numeric not null default 0,
  creator_payout        numeric not null default 0,

  brief                 jsonb not null default '{}'::jsonb,
  agreed_to_terms        boolean not null default false,
  agreed_to_terms_at     timestamptz,

  status                 text not null default 'pending'
                          check (status in ('pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled')),
  payment_status          text not null default 'unpaid'
                          check (payment_status in ('unpaid', 'paid', 'released', 'refunded')),

  revisions_requested     int not null default 0,
  max_revisions            int not null default 2,
  revision_reason           text,
  delivered_files           jsonb not null default '[]'::jsonb,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists collabs_brand_id_idx   on collabs(brand_id);
create index if not exists collabs_creator_id_idx on collabs(creator_id);
create index if not exists collabs_status_idx     on collabs(status);

alter table collabs enable row level security;

create policy "Participants can view their collabs"
  on collabs for select
  using (auth.uid() = brand_id or auth.uid() = creator_id);

create policy "Brands can create collabs"
  on collabs for insert
  with check (auth.uid() = brand_id);

create policy "Participants can update their collabs"
  on collabs for update
  using (auth.uid() = brand_id or auth.uid() = creator_id)
  with check (auth.uid() = brand_id or auth.uid() = creator_id);

create or replace function touch_collab_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists on_collab_update on collabs;
create trigger on_collab_update
  before update on collabs
  for each row execute procedure touch_collab_updated_at();

-- ── Link conversations to the collab they're about ────────────────────────────
-- Replaces the old free-text order_id/order_title matching.
alter table conversations
  add column if not exists collab_id uuid references collabs(id) on delete set null;

create index if not exists conversations_collab_id_idx on conversations(collab_id);

-- ── Consolidate brand/creator profile fields onto profiles ───────────────────
-- Mobile previously read/wrote separate brand_profiles/creator_profiles tables
-- (untracked, no SQL definition anywhere). Going forward both clients use
-- the single `profiles` table the web admin tooling is already built around.
alter table profiles add column if not exists wallet_balance numeric not null default 0;
alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists owner_name text;
alter table profiles add column if not exists industry text;
alter table profiles add column if not exists profile_complete boolean not null default false;

-- Payout bank accounts stored as jsonb array on the creator's profile row.
-- Each element: { id, bankName, accountNumber, accountName, isDefault }
alter table profiles add column if not exists payout_accounts jsonb not null default '[]'::jsonb;

-- In case collabs was created before revision_reason existed.
alter table collabs add column if not exists revision_reason text;
