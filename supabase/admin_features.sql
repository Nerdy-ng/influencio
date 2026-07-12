-- =============================================================================
-- Brandior Admin Features — SQL Migrations
-- Run in Supabase SQL Editor (safe to run multiple times — all are idempotent)
-- =============================================================================

-- ── Existing (already needed) ─────────────────────────────────────────────────
ALTER TABLE collabs          ADD COLUMN IF NOT EXISTS admin_flags    JSONB DEFAULT '{}';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS admin_flags    JSONB DEFAULT '{}';

-- ── Profiles extensions ───────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS restrictions        JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS force_logout_at     TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_disabled   BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_reward     INTEGER;  -- per-referral reward override
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owner_name          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance      BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_pitches       INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier                TEXT DEFAULT 'standard';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio           JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS socials             JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS niches              JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills              JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio                 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_hidden          BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_hidden    BOOLEAN DEFAULT FALSE;

-- ── Collabs extensions ────────────────────────────────────────────────────────
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS admin_note           TEXT;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS started_at           TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS delivered_at         TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS completed_at         TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS released_at          TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS refunded_at          TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS split_at             TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS paid_at              TIMESTAMPTZ;
ALTER TABLE collabs ADD COLUMN IF NOT EXISTS delivered_files      JSONB;

-- ── Disputes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collab_id       UUID REFERENCES collabs(id) ON DELETE SET NULL,
  brand_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  creator_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason          TEXT,
  raised_by       TEXT DEFAULT 'user',   -- 'user' | 'admin'
  status          TEXT DEFAULT 'open',   -- open | reviewing | resolved | closed | escalated
  resolution_type TEXT,                  -- refund | release | split | no_action
  resolution_note TEXT,
  split_brand_pct INTEGER,
  evidence        JSONB,
  amount          BIGINT,
  platform_fee    BIGINT,
  creator_payout  BIGINT,
  payment_status  TEXT,
  conversation_id UUID,
  reviewing_at    TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wallet transactions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,   -- topup | withdrawal | admin_credit | admin_debit | collab_payment | escrow_release
  amount      BIGINT NOT NULL, -- positive = credit, negative = debit
  note        TEXT,
  reference   TEXT,
  collab_id   UUID REFERENCES collabs(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payout requests (withdrawals) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount          BIGINT NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending | approved | rejected | failed | paid
  method          TEXT DEFAULT 'bank_transfer',
  bank_name       TEXT,
  account_number  TEXT,
  account_name    TEXT,
  reject_reason   TEXT,
  failed_reason   TEXT,
  retry_count     INTEGER DEFAULT 0,
  paid_at         TIMESTAMPTZ,
  approved_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Support tickets ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject         TEXT,
  message         TEXT,
  status          TEXT DEFAULT 'open',  -- open | in_progress | resolved | closed
  priority        TEXT DEFAULT 'normal',
  last_reply_at   TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL,  -- user | admin | admin_note
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Admin notifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  audience    TEXT DEFAULT 'all',   -- all | creator | brand | individual
  user_id     UUID,
  niche       TEXT,
  city        TEXT,
  deep_link   TEXT,
  image_url   TEXT,
  status      TEXT DEFAULT 'sent',  -- sent | scheduled | failed
  schedule_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CMS content ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,        -- faq | help_article | terms | privacy | banner | maintenance
  title       TEXT NOT NULL,
  body        TEXT,
  content     TEXT,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reviews extensions ────────────────────────────────────────────────────────
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden    BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured  BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reported  BOOLEAN DEFAULT FALSE;

-- ── Rate cards extensions ─────────────────────────────────────────────────────
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS hidden    BOOLEAN DEFAULT FALSE;
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS reported  BOOLEAN DEFAULT FALSE;

-- ── Messages extensions ───────────────────────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reported       BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS report_reason  TEXT;

-- ── Conversations extensions ──────────────────────────────────────────────────
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS locked     BOOLEAN DEFAULT FALSE;

-- ── Site settings (key-value store for all config) ────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── User reports ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason       TEXT,
  resolved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reported content ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reported_content (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID,
  reporter_name TEXT,
  content_type  TEXT,  -- rate_card | portfolio | bio | message | review
  content_id    UUID,
  reason        TEXT,
  resolved      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Login history ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip          TEXT,
  device      TEXT,
  user_agent  TEXT,
  success     BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Webhook logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event        TEXT,
  event_type   TEXT,
  source       TEXT,
  gateway      TEXT,
  status       TEXT DEFAULT 'received',
  processed    BOOLEAN DEFAULT FALSE,
  payload      JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Referrals extensions ──────────────────────────────────────────────────────
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_amount BIGINT DEFAULT 0;

-- =============================================================================
-- RLS Policies (admin panel queries use service role — add policies as needed)
-- =============================================================================

-- Enable RLS on new tables (admin uses service role or anon depending on setup)
ALTER TABLE disputes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs        ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read on cms_content (users need FAQs, terms etc.)
DROP POLICY IF EXISTS "cms_public_read" ON cms_content;
CREATE POLICY "cms_public_read" ON cms_content FOR SELECT USING (active = true);

-- Allow anon read on site_settings (public config like maintenance_mode)
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read" ON site_settings FOR SELECT USING (true);

-- Users can create support tickets
DROP POLICY IF EXISTS "support_tickets_insert" ON support_tickets;
CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "support_tickets_read_own" ON support_tickets;
CREATE POLICY "support_tickets_read_own" ON support_tickets FOR SELECT USING (auth.uid() = user_id);

-- Users can report others
DROP POLICY IF EXISTS "user_reports_insert" ON user_reports;
CREATE POLICY "user_reports_insert" ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own wallet transactions
DROP POLICY IF EXISTS "wallet_tx_read_own" ON wallet_transactions;
CREATE POLICY "wallet_tx_read_own" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own payout requests
DROP POLICY IF EXISTS "payout_requests_read_own" ON payout_requests;
CREATE POLICY "payout_requests_read_own" ON payout_requests FOR SELECT USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "payout_requests_insert" ON payout_requests;
CREATE POLICY "payout_requests_insert" ON payout_requests FOR INSERT WITH CHECK (auth.uid() = creator_id);
