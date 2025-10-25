-- 20251025_init_dewrk.sql
-- Idempotent migration for Dewrk testnet hub

BEGIN;

-- 1) Gerekli extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Ana tablo (additive; varsa tekrar oluşturmaz)
CREATE TABLE IF NOT EXISTS public.dewrk_testnets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL,
  name            text NOT NULL,
  status          text,
  network         text,
  difficulty      text,
  estTimeMinutes  integer,
  rewardType      text,
  rewardNote      text,
  kycRequired     boolean,
  requiresWallet  boolean,
  tags            text[],
  tasksCount      integer,
  totalRaisedUSD  numeric,
  hasDashboard    boolean,
  websiteUrl      text,
  githubUrl       text,
  twitterUrl      text,
  discordUrl      text,
  dashboardUrl    text,
  shortDescription text,
  categories      text[],
  highlights      text[],
  prerequisites   text[],
  gettingStarted  text[],
  discordRoles    jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2.a) Eksik kolonlar additive eklenecek (idempotent)
ALTER TABLE public.dewrk_testnets
  ADD COLUMN IF NOT EXISTS totalRaisedUSD  numeric,
  ADD COLUMN IF NOT EXISTS hasDashboard    boolean,
  ADD COLUMN IF NOT EXISTS websiteUrl      text,
  ADD COLUMN IF NOT EXISTS githubUrl       text,
  ADD COLUMN IF NOT EXISTS twitterUrl      text,
  ADD COLUMN IF NOT EXISTS discordUrl      text,
  ADD COLUMN IF NOT EXISTS dashboardUrl    text,
  ADD COLUMN IF NOT EXISTS shortDescription text,
  ADD COLUMN IF NOT EXISTS categories      text[],
  ADD COLUMN IF NOT EXISTS highlights      text[],
  ADD COLUMN IF NOT EXISTS prerequisites   text[],
  ADD COLUMN IF NOT EXISTS gettingStarted  text[],
  ADD COLUMN IF NOT EXISTS discordRoles    jsonb,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

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
END$$;

-- 3) updated_at tetikleyicisi
CREATE OR REPLACE FUNCTION public.dewrk_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dewrk_testnets_set_updated_at ON public.dewrk_testnets;
CREATE TRIGGER dewrk_testnets_set_updated_at
BEFORE UPDATE ON public.dewrk_testnets
FOR EACH ROW EXECUTE FUNCTION public.dewrk_set_updated_at();

-- 4) Görünümler (views) – tekrar çalıştırılabilir
-- Liste görünümü: sadece listede gereken alanlar
CREATE OR REPLACE VIEW public.v_dewrk_testnets_list AS
SELECT
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.estTimeMinutes,
  t.rewardType,
  t.kycRequired,
  t.tags,
  t.tasksCount,
  t.totalRaisedUSD,
  t.hasDashboard,
  t.updated_at
FROM public.dewrk_testnets t;

-- Detay görünümü: tüm alanlar
CREATE OR REPLACE VIEW public.v_dewrk_testnets_detail AS
SELECT
  t.*
FROM public.dewrk_testnets t;

-- 5) Yetkiler (Supabase default rolleri)
-- Not: Uygulamada RLS/policies kullanıyorsan, uygun politika tanımlarını ayrı migration’da ekle.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.v_dewrk_testnets_list  TO anon, authenticated;
GRANT SELECT ON public.v_dewrk_testnets_detail TO anon, authenticated;

-- Tablo üzerinde tam yetkiyi service_role'a ver (uygulama yazmaları için)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dewrk_testnets TO service_role;

-- 6) Seed (idempotent UPSERT)
-- Mevcutsa günceller, yoksa ekler. Unique (slug) ihlali vermez.
INSERT INTO public.dewrk_testnets
  (slug, name, status, network, tasksCount, tags, hasDashboard, totalRaisedUSD)
VALUES
  ('citrea',       'Citrea',       'LIVE', 'Bitcoin',   7, ARRAY['rollup','btc'], true,  NULL),
  ('example-net',  'Example Net',  'TEST', 'Ethereum',  3, ARRAY['evm','test'],  false, NULL)
ON CONFLICT (slug) DO UPDATE
SET
  name         = EXCLUDED.name,
  status       = EXCLUDED.status,
  network      = EXCLUDED.network,
  tasksCount   = EXCLUDED.tasksCount,
  tags         = EXCLUDED.tags,
  hasDashboard = EXCLUDED.hasDashboard,
  totalRaisedUSD = EXCLUDED.totalRaisedUSD;

COMMIT;
