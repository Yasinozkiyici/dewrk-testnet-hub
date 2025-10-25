-- 20251025_init_dewrk.sql
-- Idempotent migration for Dewrk testnet hub

BEGIN;

-- 1) Gerekli extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Ana tablo (additive; varsa tekrar oluşturmaz)
CREATE TABLE IF NOT EXISTS public.dewrk_testnets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  network text,
  status text,
  difficulty text,
  est_time_minutes integer,
  reward_type text,
  reward_note text,
  kyc_required boolean DEFAULT false,
  requires_wallet boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  categories text[] DEFAULT '{}',
  highlights text[] DEFAULT '{}',
  prerequisites text[] DEFAULT '{}',
  getting_started jsonb DEFAULT '[]'::jsonb,
  discord_roles jsonb DEFAULT '[]'::jsonb,
  website_url text,
  github_url text,
  twitter_url text,
  discord_url text,
  dashboard_url text,
  has_dashboard boolean DEFAULT false,
  logo_url text,
  hero_image_url text,
  short_description text,
  tasks_count integer DEFAULT 0,
  total_raised_usd numeric(18,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.a) Eksik kolonlar additive eklenecek (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dewrk_testnets'
      AND column_name = 'est_time_minutes'
  ) THEN
    ALTER TABLE public.dewrk_testnets ADD COLUMN est_time_minutes integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dewrk_testnets'
      AND column_name = 'total_raised_usd'
  ) THEN
    ALTER TABLE public.dewrk_testnets ADD COLUMN total_raised_usd numeric(18,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dewrk_testnets'
      AND column_name = 'has_dashboard'
  ) THEN
    ALTER TABLE public.dewrk_testnets ADD COLUMN has_dashboard boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dewrk_testnets'
      AND column_name = 'website_url'
  ) THEN
    ALTER TABLE public.dewrk_testnets
      ADD COLUMN website_url text,
      ADD COLUMN github_url  text,
      ADD COLUMN twitter_url text,
      ADD COLUMN discord_url text,
      ADD COLUMN dashboard_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dewrk_testnets'
      AND column_name = 'short_description'
  ) THEN
    ALTER TABLE public.dewrk_testnets ADD COLUMN short_description text;
  END IF;
END $$;

-- 2.b) slug benzersizliği (varsa ekleme)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dewrk_testnets_slug_key'
  ) THEN
    ALTER TABLE public.dewrk_testnets
      ADD CONSTRAINT dewrk_testnets_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 3) updated_at tetikleyicisi
DROP TRIGGER IF EXISTS set_timestamp_on_dewrk_testnets ON public.dewrk_testnets;

CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_timestamp_on_dewrk_testnets
BEFORE UPDATE ON public.dewrk_testnets
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp();

-- 4) Görünüm – public liste/detail birleşik
CREATE OR REPLACE VIEW public.dewrk_testnets_public AS
SELECT
  t.id,
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.est_time_minutes,
  t.reward_type,
  t.reward_note,
  t.kyc_required,
  t.requires_wallet,
  t.tags,
  t.categories,
  t.highlights,
  t.prerequisites,
  t.getting_started,
  t.logo_url,
  t.hero_image_url,
  t.short_description,
  t.tasks_count,
  t.updated_at,
  t.total_raised_usd,
  t.has_dashboard,
  t.dashboard_url,
  t.website_url,
  t.github_url,
  t.twitter_url,
  t.discord_url
FROM public.dewrk_testnets t;

-- Eski camelCase view'lerine geriye dönük uyum
CREATE OR REPLACE VIEW public.dewrk_v_testnets_list AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.network,
  p.status,
  p.difficulty,
  p.est_time_minutes      AS "estTimeMinutes",
  p.reward_type           AS "rewardType",
  p.reward_note           AS "rewardNote",
  p.kyc_required          AS "kycRequired",
  p.requires_wallet       AS "requiresWallet",
  p.tags,
  p.categories,
  p.highlights,
  p.prerequisites,
  p.getting_started       AS "gettingStarted",
  p.logo_url              AS "logoUrl",
  p.hero_image_url        AS "heroImageUrl",
  p.short_description     AS "shortDescription",
  p.tasks_count           AS "tasksCount",
  p.updated_at            AS "updatedAt",
  p.total_raised_usd      AS "totalRaisedUSD",
  p.has_dashboard         AS "hasDashboard",
  p.dashboard_url         AS "dashboardUrl",
  p.website_url           AS "websiteUrl",
  p.github_url            AS "githubUrl",
  p.twitter_url           AS "twitterUrl",
  p.discord_url           AS "discordUrl"
FROM public.dewrk_testnets_public p;

CREATE OR REPLACE VIEW public.dewrk_v_testnet_detail AS
SELECT
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.est_time_minutes      AS "estTimeMinutes",
  t.reward_type           AS "rewardType",
  t.reward_note           AS "rewardNote",
  t.kyc_required          AS "kycRequired",
  t.requires_wallet       AS "requiresWallet",
  t.tags,
  t.categories,
  t.highlights,
  t.prerequisites,
  t.getting_started       AS "gettingStarted",
  t.logo_url              AS "logoUrl",
  t.hero_image_url        AS "heroImageUrl",
  t.short_description     AS "shortDescription",
  t.tasks_count           AS "tasksCount",
  t.updated_at            AS "updated",
  t.created_at            AS "created",
  t.total_raised_usd      AS "totalRaisedUSD",
  t.has_dashboard         AS "hasDashboard",
  t.dashboard_url         AS "dashboardUrl",
  t.website_url           AS "websiteUrl",
  t.github_url            AS "githubUrl",
  t.twitter_url           AS "twitterUrl",
  t.discord_url           AS "discordUrl",
  t.discord_roles         AS "discordRoles"
FROM public.dewrk_testnets t;

-- 5) Yetkiler (Supabase default rolleri)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.dewrk_testnets_public TO anon, authenticated;
GRANT SELECT ON public.dewrk_v_testnets_list TO anon, authenticated;
GRANT SELECT ON public.dewrk_v_testnet_detail TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dewrk_testnets TO service_role;

-- 6) Seed (idempotent UPSERT)
INSERT INTO public.dewrk_testnets
  (slug, name, status, network, tasks_count, tags, has_dashboard, total_raised_usd, est_time_minutes)
VALUES
  ('citrea',       'Citrea',       'LIVE', 'Bitcoin',   7, ARRAY['rollup','btc'], true,  NULL, NULL),
  ('example-net',  'Example Net',  'TEST', 'Ethereum',  3, ARRAY['evm','test'],  false, NULL, NULL)
ON CONFLICT (slug) DO UPDATE
SET
  name             = EXCLUDED.name,
  status           = EXCLUDED.status,
  network          = EXCLUDED.network,
  tasks_count      = EXCLUDED.tasks_count,
  tags             = EXCLUDED.tags,
  has_dashboard    = EXCLUDED.has_dashboard,
  total_raised_usd = EXCLUDED.total_raised_usd,
  est_time_minutes = EXCLUDED.est_time_minutes;

COMMIT;
