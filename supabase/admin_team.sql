-- Run this in Supabase SQL Editor

-- Admin team accounts (managers, staff, admins)
create table if not exists admin_users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  role        text not null check (role in ('admin', 'manager', 'staff')),
  status      text not null default 'Active' check (status in ('Active', 'Inactive')),
  last_login  timestamptz,
  created_at  timestamptz default now()
);

-- RLS: only accessible from service role / admin context (no client RLS needed — admin panel uses service key or checks localStorage session)
alter table admin_users enable row level security;
create policy "Admin users visible to authenticated" on admin_users for select using (auth.role() = 'authenticated');
create policy "Admin users insertable by authenticated" on admin_users for insert with check (auth.role() = 'authenticated');
create policy "Admin users updatable by authenticated" on admin_users for update using (auth.role() = 'authenticated');

-- Approvals queue (staff/manager actions that need admin sign-off)
create table if not exists admin_approvals (
  id               uuid primary key default gen_random_uuid(),
  requester_name   text not null,
  requester_role   text not null,
  type             text not null,
  description      text not null,
  target           text not null,
  target_id        uuid,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'escalated')),
  reviewed_by      text,
  reviewed_at      timestamptz,
  created_at       timestamptz default now()
);

alter table admin_approvals enable row level security;
create policy "Approvals visible to authenticated" on admin_approvals for select using (auth.role() = 'authenticated');
create policy "Approvals insertable by authenticated" on admin_approvals for insert with check (auth.role() = 'authenticated');
create policy "Approvals updatable by authenticated" on admin_approvals for update using (auth.role() = 'authenticated');
