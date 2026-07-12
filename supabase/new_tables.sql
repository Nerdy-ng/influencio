-- ── notifications ──────────────────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade not null,
  title      text not null,
  body       text not null,
  type       text not null default 'general',
  data       jsonb not null default '{}',
  read       bool not null default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "own notifications" on notifications
  for all using (auth.uid() = user_id);
create index if not exists notifications_user_created on notifications(user_id, created_at desc);

-- ── collab_ratings ──────────────────────────────────────────────────────────
create table if not exists collab_ratings (
  id          uuid primary key default gen_random_uuid(),
  collab_id   uuid references collabs(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  role        text not null check (role in ('brand', 'creator')),
  rating      int  not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique (collab_id, reviewer_id)
);
alter table collab_ratings enable row level security;
create policy "insert own rating" on collab_ratings
  for insert with check (auth.uid() = reviewer_id);
create policy "read collab participants" on collab_ratings
  for select using (
    exists (
      select 1 from collabs
      where collabs.id = collab_id
        and (collabs.brand_id = auth.uid() or collabs.creator_id = auth.uid())
    )
  );

-- ── custom_offers ───────────────────────────────────────────────────────────
create table if not exists custom_offers (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid references profiles(id) on delete cascade not null,
  creator_id   uuid references profiles(id) on delete cascade not null,
  sender_role  text not null check (sender_role in ('brand', 'creator')),
  title        text not null,
  brief        text,
  budget       int  not null,
  deliverables jsonb not null default '[]',
  timeline     text,
  attachments  jsonb not null default '[]',
  status       text not null default 'offer_pending'
                 check (status in ('offer_pending', 'accepted', 'declined', 'paid')),
  created_at   timestamptz default now()
);
alter table custom_offers enable row level security;
create policy "participants only" on custom_offers
  for all using (auth.uid() = brand_id or auth.uid() = creator_id);
create index if not exists custom_offers_brand   on custom_offers(brand_id, created_at desc);
create index if not exists custom_offers_creator on custom_offers(creator_id, created_at desc);
