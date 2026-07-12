-- Brand tier requirements, editable from admin dashboard
create table if not exists tier_config (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz default now()
);

insert into tier_config (id, config) values (
  'brand_tiers',
  '{
    "Partner":  {"label": "Brandior Partner",  "campaigns": 0, "creators": 0},
    "Elite":    {"label": "Brandior Elite",    "campaigns": 3, "creators": 5},
    "Champion": {"label": "Brandior Champion", "campaigns": 7, "creators": 20}
  }'
) on conflict (id) do nothing;

alter table tier_config enable row level security;
create policy "Admin full access" on tier_config for all using (true) with check (true);
