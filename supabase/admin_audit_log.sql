-- Admin audit log: tracks every action taken by an admin/manager/staff
create table if not exists admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_name  text not null default 'Admin',
  admin_role  text not null default 'admin',
  action      text not null,          -- e.g. 'ban_user', 'release_escrow', 'send_push'
  target_type text,                   -- 'user', 'collab', 'notification', etc.
  target_id   text,                   -- the affected row's id (text so it works for any type)
  target_label text,                  -- human-readable label, e.g. user's name
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

alter table admin_audit_log enable row level security;
create policy "audit log readable by authenticated" on admin_audit_log
  for select using (auth.role() = 'authenticated');
create policy "audit log insertable by authenticated" on admin_audit_log
  for insert with check (auth.role() = 'authenticated');

create index if not exists admin_audit_log_created on admin_audit_log(created_at desc);
create index if not exists admin_audit_log_action  on admin_audit_log(action);
