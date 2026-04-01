-- Run this in Supabase SQL Editor

create table if not exists reviews (
  id              uuid primary key default gen_random_uuid(),
  talent_id       uuid not null references auth.users(id) on delete cascade,
  reviewer_id     uuid not null references auth.users(id) on delete cascade,
  job_id          uuid references jobs(id) on delete set null,
  rating          smallint not null check (rating between 1 and 5),
  comment         text,
  brand_name      text,
  brand_initials  text,
  campaign_type   text,
  created_at      timestamptz not null default now(),
  unique (talent_id, reviewer_id, job_id)
);

create index if not exists reviews_talent_id_idx on reviews(talent_id);

-- RLS
alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

create policy "Authenticated users can insert reviews"
  on reviews for insert
  with check (auth.uid() = reviewer_id);

-- Add avg_rating and review_count to profiles if not exists
alter table profiles
  add column if not exists avg_rating numeric(3,2) default 0,
  add column if not exists review_count int default 0;

-- Function to update avg_rating + review_count on profiles after review insert
create or replace function update_talent_rating()
returns trigger language plpgsql as $$
begin
  update profiles
  set
    avg_rating   = (select round(avg(rating)::numeric, 2) from reviews where talent_id = NEW.talent_id),
    review_count = (select count(*) from reviews where talent_id = NEW.talent_id)
  where id = NEW.talent_id;
  return NEW;
end;
$$;

drop trigger if exists on_review_insert on reviews;
create trigger on_review_insert
  after insert on reviews
  for each row execute procedure update_talent_rating();
