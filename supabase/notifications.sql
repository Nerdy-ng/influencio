-- Run this in Supabase SQL Editor

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text not null,
  read        boolean not null default false,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- RLS
alter table notifications enable row level security;

create policy "Users can read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Service role can insert (triggered from app)
create policy "Service can insert notifications"
  on notifications for insert
  with check (true);

-- Enable realtime
alter publication supabase_realtime add table notifications;
