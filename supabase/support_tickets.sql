-- Run this in Supabase SQL Editor

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  user_name text,
  role text default 'talent',
  category text not null,
  subject text not null,
  message text not null,
  status text default 'open',       -- open | in_progress | resolved | closed
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

alter table support_tickets enable row level security;

-- Users can insert their own tickets
create policy "Users can submit tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

-- Users can read their own tickets
create policy "Users can view own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);

-- Admins (service role) can do everything — handled server-side or via supabase service key
