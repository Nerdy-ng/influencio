-- Brandiór Platform — PostgreSQL Schema
-- Run with: psql $DATABASE_URL -f server/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
--  CREATORS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creators (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  handle              TEXT NOT NULL UNIQUE,
  avatar_url          TEXT,
  tier                TEXT NOT NULL CHECK (tier IN ('fast-rising', 'next-rated', 'top-rated')),
  rating              DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  niches              TEXT[] NOT NULL DEFAULT '{}',
  location            TEXT,
  bio                 TEXT,
  platforms           JSONB NOT NULL DEFAULT '[]',
  content_styles      TEXT[] NOT NULL DEFAULT '{}',
  available_for_hire  BOOLEAN NOT NULL DEFAULT TRUE,
  completed_campaigns INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creators_tier            ON creators (tier);
CREATE INDEX IF NOT EXISTS idx_creators_available       ON creators (available_for_hire);
CREATE INDEX IF NOT EXISTS idx_creators_niches          ON creators USING GIN (niches);
CREATE INDEX IF NOT EXISTS idx_creators_handle          ON creators (handle);

-- ─────────────────────────────────────────────
--  PACKAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES creators (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  deliverables    TEXT[] NOT NULL DEFAULT '{}',
  price_ngn       INT NOT NULL CHECK (price_ngn > 0),
  delivery_days   INT NOT NULL CHECK (delivery_days > 0),
  revisions       INT NOT NULL DEFAULT 1,
  platform        TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_creator    ON packages (creator_id);
CREATE INDEX IF NOT EXISTS idx_packages_platform   ON packages (platform);
CREATE INDEX IF NOT EXISTS idx_packages_price      ON packages (price_ngn);
CREATE INDEX IF NOT EXISTS idx_packages_active     ON packages (is_active);

-- ─────────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id           UUID NOT NULL REFERENCES packages (id),
  creator_id           UUID NOT NULL REFERENCES creators (id),
  brand_id             UUID NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','in_progress','delivered','revision_requested','completed','cancelled')),
  payment_status       TEXT NOT NULL DEFAULT 'unpaid'
                         CHECK (payment_status IN ('unpaid','escrow','released','refunded')),
  brief                JSONB NOT NULL DEFAULT '{}',
  delivered_files      TEXT[] NOT NULL DEFAULT '{}',
  revisions_requested  INT NOT NULL DEFAULT 0,
  max_revisions        INT NOT NULL DEFAULT 2,
  amount_ngn           INT NOT NULL,
  platform_fee_ngn     INT NOT NULL,
  creator_payout_ngn   INT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_package        ON orders (package_id);
CREATE INDEX IF NOT EXISTS idx_orders_creator        ON orders (creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_brand          ON orders (brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
--  NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);
