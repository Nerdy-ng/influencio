-- Referral tracking
-- referrer = existing user who shared the code
-- referee  = new user who signed up using that code

create table if not exists referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references profiles(id) on delete cascade,
  referee_id      uuid          references profiles(id) on delete set null,
  referee_name    text not null default '',
  referee_initials text not null default '',
  referee_color   text not null default '#7c3aed',
  status          text not null default 'pending' check (status in ('pending', 'earned')),
  amount          numeric not null default 2500,
  created_at      timestamptz not null default now()
);

create index if not exists referrals_referrer_id_idx on referrals(referrer_id);
create index if not exists referrals_referee_id_idx  on referrals(referee_id);

-- RLS: referrers can read their own rows; service role handles inserts/updates
alter table referrals enable row level security;

create policy "referrals_select_own" on referrals
  for select using (auth.uid() = referrer_id);
