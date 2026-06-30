-- Run this in Supabase SQL Editor
-- Depends on collabs.sql (run that first).

create table if not exists disputes (
  id                  uuid primary key default gen_random_uuid(),
  collab_id           uuid references collabs(id) on delete set null,
  brand_id            uuid not null references auth.users(id) on delete cascade,
  talent_id           uuid not null references auth.users(id) on delete cascade,
  raised_by           uuid not null references auth.users(id) on delete cascade,
  raised_by_role      text not null check (raised_by_role in ('brand', 'talent')),

  reason              text not null,
  brand_statement     text,
  talent_statement    text,
  evidence_urls       jsonb not null default '[]'::jsonb,

  status              text not null default 'open'
                       check (status in ('open', 'awaiting_response', 'under_review', 'ai_analyzed', 'resolved', 'closed')),

  -- AI analysis
  ai_summary          text,
  ai_recommendation   text check (ai_recommendation in ('favor_brand', 'favor_talent', 'split', 'more_info_needed')),
  ai_confidence       smallint check (ai_confidence between 0 and 100),
  ai_reasoning        text,
  ai_analyzed_at      timestamptz,

  -- Admin resolution
  admin_decision      text check (admin_decision in ('favor_brand', 'favor_talent', 'split', 'dismissed')),
  admin_notes         text,
  resolved_by         text,
  resolved_at         timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists disputes_brand_id_idx  on disputes(brand_id);
create index if not exists disputes_talent_id_idx on disputes(talent_id);
create index if not exists disputes_collab_id_idx on disputes(collab_id);
create index if not exists disputes_status_idx    on disputes(status);

-- updated_at bump
create or replace function touch_dispute_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists on_dispute_update on disputes;
create trigger on_dispute_update
  before update on disputes
  for each row execute procedure touch_dispute_updated_at();

-- RLS
alter table disputes enable row level security;

-- Either participant can view a dispute they're part of
create policy "Participants can view their disputes"
  on disputes for select
  using (auth.uid() = brand_id or auth.uid() = talent_id);

-- Either participant can raise a dispute, as long as they are one of the two parties
create policy "Participants can raise a dispute"
  on disputes for insert
  with check (
    auth.uid() = raised_by
    and (auth.uid() = brand_id or auth.uid() = talent_id)
  );

-- The counterparty can respond (add their statement) while it's open
create policy "Counterparty can respond"
  on disputes for update
  using (
    (auth.uid() = brand_id or auth.uid() = talent_id)
    and status in ('open', 'awaiting_response')
  )
  with check (
    auth.uid() = brand_id or auth.uid() = talent_id
  );

-- AI analysis + admin decisions are written server-side via the Supabase service key
