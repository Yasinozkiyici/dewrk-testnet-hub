-- Supabase Dashboard'da çalıştırın
-- CREATE VIEW dewrk_v_testnets_list

CREATE OR REPLACE VIEW public.dewrk_v_testnets_list AS
SELECT
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.est_time_minutes AS "estTimeMinutes",
  t.reward_type AS "rewardType",
  t.reward_note AS "rewardNote",
  t.kyc_required AS "kycRequired",
  t.tags,
  t.tasks_count AS "tasksCount",
  t.updated_at AS "updated",
  t.total_raised_usd AS "totalRaisedUSD",
  t.has_dashboard AS "hasDashboard",
  t.logo_url AS "logoUrl"
FROM public.dewrk_testnets t;

GRANT SELECT ON public.dewrk_v_testnets_list TO anon, authenticated;

