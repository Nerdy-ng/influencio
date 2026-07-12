-- Referral tracking
-- referrer = existing user who shared the code
-- referee  = new user who signed up using that code

create table if not exists referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid not null references profiles(id) on delete cascade,
  referee_id       uuid          references profiles(id) on delete set null,
  referee_name     text not null default '',
  referee_initials text not null default '',
  referee_color    text not null default '#7c3aed',
  status           text not null default 'pending' check (status in ('pending', 'earned')),
  amount           numeric not null default 2500,
  created_at       timestamptz not null default now()
);

create index if not exists referrals_referrer_id_idx on referrals(referrer_id);
create index if not exists referrals_referee_id_idx  on referrals(referee_id);

alter table referrals enable row level security;

create policy "referrals_select_own" on referrals
  for select using (auth.uid() = referrer_id);

-- ── Payout trigger ────────────────────────────────────────────────────────────
-- Fires when a collab status changes to 'completed'.
-- Finds any pending referral for the creator or brand involved,
-- marks it earned, and credits the referrer's wallet.

create or replace function handle_referral_payout()
returns trigger language plpgsql security definer as $$
declare
  v_ref record;
  participant_ids uuid[];
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status <> 'completed') then

    participant_ids := array[NEW.creator_id, NEW.brand_id];

    for v_ref in
      select * from referrals
      where referee_id = any(participant_ids)
        and status = 'pending'
    loop
      -- Mark earned
      update referrals set status = 'earned' where id = v_ref.id;

      -- Credit referrer wallet
      update profiles
        set wallet_balance = coalesce(wallet_balance, 0) + v_ref.amount
        where id = v_ref.referrer_id;
    end loop;

  end if;
  return NEW;
end;
$$;

drop trigger if exists on_collab_completed_referral on collabs;
create trigger on_collab_completed_referral
  after update on collabs
  for each row execute procedure handle_referral_payout();
