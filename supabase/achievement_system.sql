-- ─────────────────────────────────────────────────────────────────────────────
-- Brandior Achievement System — unified creator tier computation
-- Replaces fast-rising/next-rated/top-rated with spark/rising/pro/champion
-- Adds payment_status = 'released' gate
-- Adds unique-brand count gate at Pro (3) and Champion (6)
-- Safe to run multiple times (all CREATE OR REPLACE / DROP IF EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Shared tier computation helper ───────────────────────────────────────
-- Called by both the collab trigger and _award_spark_internal.
-- Reads spark_earned, counts paid completions + unique brands, sets tier.
-- Never demotes — only promotes.
CREATE OR REPLACE FUNCTION _compute_creator_tier_internal(p_creator_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_spark    boolean;
  v_cur_tier text;
  v_count    int;
  v_unique   int;
  v_new_tier text;
  v_new_rank int;
  v_cur_rank int;
  v_rows     int;
BEGIN
  SELECT spark_earned, tier
  INTO v_spark, v_cur_tier
  FROM profiles
  WHERE id = p_creator_id;

  IF NOT FOUND OR NOT v_spark THEN
    RETURN NULL;
  END IF;

  IF v_cur_tier = 'champion' THEN
    RETURN 'champion';
  END IF;

  SELECT COUNT(*), COUNT(DISTINCT brand_id)
  INTO v_count, v_unique
  FROM collabs
  WHERE creator_id = p_creator_id
    AND status         = 'completed'
    AND payment_status = 'released';

  v_new_tier :=
    CASE
      WHEN v_count >= 25 AND v_unique >= 6 THEN 'champion'
      WHEN v_count >= 10 AND v_unique >= 3 THEN 'pro'
      WHEN v_count >= 3                   THEN 'rising'
      ELSE                                     'spark'
    END;

  v_new_rank := CASE v_new_tier
    WHEN 'spark'    THEN 1
    WHEN 'rising'   THEN 2
    WHEN 'pro'      THEN 3
    WHEN 'champion' THEN 4
    ELSE 0
  END;
  v_cur_rank := CASE v_cur_tier
    WHEN 'spark'    THEN 1
    WHEN 'rising'   THEN 2
    WHEN 'pro'      THEN 3
    WHEN 'champion' THEN 4
    ELSE 0
  END;

  IF v_new_rank <= v_cur_rank THEN
    RETURN v_cur_tier;
  END IF;

  UPDATE profiles
  SET tier = v_new_tier
  WHERE id = p_creator_id
    AND tier IS NOT DISTINCT FROM v_cur_tier;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows = 1 AND v_new_tier IN ('rising', 'pro', 'champion') THEN
    BEGIN
      INSERT INTO notifications (user_id, type, title, body, metadata, read)
      VALUES (
        p_creator_id,
        'badge',
        CASE v_new_tier
          WHEN 'rising'   THEN 'You''re now Rising! ✨'
          WHEN 'pro'      THEN 'You''re now a Pro! 🎯'
          WHEN 'champion' THEN 'You''ve reached Champion! 🏆'
        END,
        CASE v_new_tier
          WHEN 'rising' THEN
            'You''ve completed 3 collaborations on Brandior and earned the Rising tier. Keep building — 10 paid collabs with 3 brands unlocks Pro!'
          WHEN 'pro' THEN
            'You''ve completed 10 collaborations with 3 brands and earned the Pro tier. 25 paid collabs with 6 unique brands unlocks Champion!'
          WHEN 'champion' THEN
            'You''ve completed 25 collaborations with 6 unique brands and reached Champion — the highest tier on Brandior!'
        END,
        '{"screen": "badge"}'::jsonb,
        false
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  RETURN v_new_tier;
END;
$$;


-- ─── 2. Collab trigger function ───────────────────────────────────────────────
-- Fires when a collab becomes a paid completion (status=completed + payment_status=released).
CREATE OR REPLACE FUNCTION check_creator_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (NEW.status = 'completed' AND NEW.payment_status = 'released') THEN
    RETURN NEW;
  END IF;
  IF OLD.status = 'completed' AND OLD.payment_status = 'released' THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM _compute_creator_tier_internal(NEW.creator_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$$;


-- ─── 3. Update trigger to watch both status and payment_status ────────────────
DROP TRIGGER IF EXISTS collabs_check_creator_tier_trigger ON collabs;
CREATE TRIGGER collabs_check_creator_tier_trigger
  AFTER UPDATE OF status, payment_status
  ON collabs
  FOR EACH ROW
  EXECUTE FUNCTION check_creator_tier();


-- ─── 4. Award Spark + immediately compute tier ───────────────────────────────
-- Replaces existing _award_spark_internal.
-- Criteria unchanged; adds _compute_creator_tier_internal call after award.
CREATE OR REPLACE FUNCTION _award_spark_internal(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile  profiles%ROWTYPE;
  v_has_rate boolean;
  v_rows     int;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  IF v_profile.spark_earned THEN
    RETURN jsonb_build_object('ok', true, 'already_earned', true);
  END IF;

  IF v_profile.full_name IS NULL OR TRIM(v_profile.full_name) = '' THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'full_name');
  END IF;
  IF v_profile.creator_avatar_url IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'creator_avatar_url');
  END IF;
  IF array_length(v_profile.niches, 1) IS NULL OR array_length(v_profile.niches, 1) < 1 THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'niches');
  END IF;
  IF v_profile.portfolio IS NULL
     OR jsonb_typeof(v_profile.portfolio) <> 'array'
     OR jsonb_array_length(v_profile.portfolio) < 1 THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'portfolio');
  END IF;
  IF v_profile.rubies_account_number IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'rubies_account_number');
  END IF;

  SELECT EXISTS(SELECT 1 FROM rate_cards WHERE creator_id = p_user_id) INTO v_has_rate;
  IF NOT v_has_rate THEN
    RETURN jsonb_build_object('ok', true, 'earned', false, 'missing', 'rate_card');
  END IF;

  UPDATE profiles SET spark_earned = true
  WHERE id = p_user_id AND NOT spark_earned;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows = 1 THEN
    -- Set tier to 'spark' (or higher if paid collabs already qualify)
    PERFORM _compute_creator_tier_internal(p_user_id);

    BEGIN
      INSERT INTO notifications (user_id, type, title, body, metadata, read)
      VALUES (
        p_user_id,
        'badge',
        'You earned the Spark badge! 🎉',
        E'Congratulations! You''ve completed your creator profile and earned the Brandior Spark badge.\n\n'
        || E'Complete 3 paid collaborations to unlock Rising!\n\n'
        || '- The Brandior Team',
        '{"screen": "badge"}'::jsonb,
        false
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    RETURN jsonb_build_object('ok', true, 'earned', true);
  END IF;

  RETURN jsonb_build_object('ok', true, 'earned', false);
END;
$$;
