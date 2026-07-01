-- Custom offers: a Brand can send a custom project offer to a Creator
-- before a full collab is created.
-- Status: offer_pending → accepted (→ creates a collab) | declined | withdrawn

create table if not exists custom_offers (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid not null references profiles(id) on delete cascade,
  creator_id    uuid not null references profiles(id) on delete cascade,
  title         text not null,
  brief         text not null,
  deliverables  text[] not null default '{}',
  budget        numeric not null,
  timeline      text,
  status        text not null default 'offer_pending'
                  check (status in ('offer_pending', 'accepted', 'declined', 'withdrawn')),
  collab_id     uuid references collabs(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists custom_offers_brand_id_idx   on custom_offers(brand_id);
create index if not exists custom_offers_creator_id_idx on custom_offers(creator_id);

alter table custom_offers enable row level security;

-- Participants (brand or creator) can read offers they're part of
create policy "custom_offers_select" on custom_offers
  for select using (auth.uid() = brand_id or auth.uid() = creator_id);

-- Brands can insert
create policy "custom_offers_insert" on custom_offers
  for insert with check (auth.uid() = brand_id);

-- Both parties can update status (brand withdraws, creator accepts/declines)
create policy "custom_offers_update" on custom_offers
  for update using (auth.uid() = brand_id or auth.uid() = creator_id);
