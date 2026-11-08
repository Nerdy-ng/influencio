-- Dual-role capability columns for profiles
-- Idempotent: safe to run more than once
-- DO NOT modify: wallets, transactions, collaborations, messages, campaigns

-- Step 1: Add columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_brand_access    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_creator_access  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS active_workspace    TEXT CHECK (active_workspace IN ('brand', 'creator'));

-- Step 2: Seed existing users from their current profiles.role
-- WHERE clause makes this safe to re-run: only touches rows that haven't been seeded yet
UPDATE public.profiles
SET
  has_brand_access   = (role ILIKE 'brand'),
  has_creator_access = (role ILIKE 'talent' OR role ILIKE 'creator'),
  active_workspace   = CASE
    WHEN role ILIKE 'brand'   THEN 'brand'
    WHEN role ILIKE 'talent'  THEN 'creator'
    WHEN role ILIKE 'creator' THEN 'creator'
    ELSE NULL
  END
WHERE has_brand_access = FALSE AND has_creator_access = FALSE;

-- Step 3: Auto-seed new users on INSERT (signup flow writes profiles.role first)
CREATE OR REPLACE FUNCTION public.sync_profile_capabilities()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.has_brand_access = FALSE AND NEW.has_creator_access = FALSE AND NEW.role IS NOT NULL THEN
    NEW.has_brand_access   := (NEW.role ILIKE 'brand');
    NEW.has_creator_access := (NEW.role ILIKE 'talent' OR NEW.role ILIKE 'creator');
    NEW.active_workspace   := CASE
      WHEN NEW.role ILIKE 'brand'   THEN 'brand'
      WHEN NEW.role ILIKE 'talent'  THEN 'creator'
      WHEN NEW.role ILIKE 'creator' THEN 'creator'
      ELSE NULL
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_capabilities_on_insert ON public.profiles;
CREATE TRIGGER sync_capabilities_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_capabilities();
