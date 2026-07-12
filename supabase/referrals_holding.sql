-- Run this in Supabase SQL Editor
-- Adds 30-day holding period before referral bonus hits the wallet

-- 1. Add holding status + tracking columns
alter table referrals drop constraint if exists referrals_status_check;
alter table referrals add constraint referrals_status_check
  check (status in ('pending', 'holding', 'earned'));

alter table referrals add column if not exists earned_at    timestamptz;
alter table referrals add column if not exists payout_after timestamptz;

-- 2. Update the collab completion trigger to set 'holding' instead of 'earned'
--    Wallet is NOT credited here — the daily cron handles that.
create or replace function handle_referral_payout()
returns trigger language plpgsql security definer as $$
declare
  v_ref           record;
  participant_ids uuid[];
  hold_days       int;
  cfg             jsonb;
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status <> 'completed') then

    -- Read hold period from admin config (default 30 days)
    select config into cfg from tier_config where id = 'referral_config';
    hold_days := coalesce((cfg->>'hold_days')::int, 30);

    participant_ids := array[NEW.creator_id, NEW.brand_id];

    for v_ref in
      select * from referrals
      where referee_id = any(participant_ids)
        and status = 'pending'
    loop
      update referrals
        set status       = 'holding',
            earned_at    = now(),
            payout_after = now() + (hold_days || ' days')::interval
        where id = v_ref.id;
    end loop;

  end if;
  return NEW;
end;
$$;

drop trigger if exists on_collab_completed_referral on collabs;
create trigger on_collab_completed_referral
  after update on collabs
  for each row execute procedure handle_referral_payout();

-- 3. Daily sweep: release holdings — reads hold_days from admin-configurable tier_config
create or replace function release_held_referrals()
returns void language plpgsql security definer as $$
declare
  v_ref    record;
  hold_days int;
  cfg      jsonb;
begin
  -- Read hold period from config, default 30 days
  select config into cfg from tier_config where id = 'referral_config';
  hold_days := coalesce((cfg->>'hold_days')::int, 30);

  for v_ref in
    select * from referrals
    where status = 'holding'
      and earned_at + (hold_days || ' days')::interval <= now()
  loop
    update referrals set status = 'earned' where id = v_ref.id;
    update profiles
      set wallet_balance = coalesce(wallet_balance, 0) + v_ref.amount
      where id = v_ref.referrer_id;
  end loop;
end;
$$;

-- 4. Enable pg_cron extension and schedule the daily sweep
create extension if not exists pg_cron with schema extensions;

-- Unschedule first in case it already exists (safe to re-run)
select cron.unschedule('release-referral-holdings')
  where exists (select 1 from cron.job where jobname = 'release-referral-holdings');

select cron.schedule(
  'release-referral-holdings',
  '0 23 * * *',   -- 23:00 UTC = midnight WAT
  'select release_held_referrals()'
);
