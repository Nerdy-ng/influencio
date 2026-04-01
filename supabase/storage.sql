-- Run this in Supabase SQL Editor

-- Create buckets
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('deliverables', 'deliverables', false) on conflict do nothing;

-- Portfolio bucket policies
create policy "Anyone can view portfolio files"
  on storage.objects for select using (bucket_id = 'portfolio');

create policy "Authenticated users can upload portfolio files"
  on storage.objects for insert
  with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

create policy "Users can delete own portfolio files"
  on storage.objects for delete
  using (bucket_id = 'portfolio' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars bucket policies
create policy "Anyone can view avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can delete own avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Deliverables bucket policies
create policy "Authenticated users can upload deliverables"
  on storage.objects for insert
  with check (bucket_id = 'deliverables' and auth.role() = 'authenticated');

create policy "Talent and brand can view deliverables"
  on storage.objects for select
  using (bucket_id = 'deliverables' and auth.uid()::text = (storage.foldername(name))[1]);

-- Deliverables table
create table if not exists deliverables (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid,
  job_title   text,
  talent_id   uuid not null references auth.users(id) on delete cascade,
  brand_id    uuid,
  file_name   text not null,
  file_url    text not null,
  file_size   bigint,
  mime_type   text,
  note        text,
  created_at  timestamptz not null default now()
);

alter table deliverables enable row level security;

create policy "Talent can insert own deliverables"
  on deliverables for insert
  with check (auth.uid() = talent_id);

create policy "Talent can view own deliverables"
  on deliverables for select
  using (auth.uid() = talent_id or auth.uid() = brand_id);

-- Add portfolio + avatar_url to profiles
alter table profiles add column if not exists portfolio jsonb default '[]';
alter table profiles add column if not exists avatar_url text;
