-- 020_public_alias_views.sql
-- Convenience public views for read-only consumers and rollback strategy

create or replace view public.dewrk_v_testnets_list as
select
  t.slug,
  t.name,
  t.status,
  t.kyc_required,
  t.tasks_count,
  t.updated_at,
  t.has_dashboard,
  t.logo_url,
  t.network,
  t.difficulty,
  t.est_time_minutes,
  t.reward_type,
  t.reward_note,
  t.tags,
  t.total_raised_usd,
  coalesce(jsonb_strip_nulls(jsonb_build_object(
    'twitter', t.twitter_url,
    'discord', t.discord_url
  )), '{}'::jsonb) as socials
from dewrk.testnets t;

create or replace view public.dewrk_v_testnet_detail as
select
  t.slug,
  t.name,
  t.status,
  t.kyc_required,
  t.tasks_count,
  t.updated_at,
  t.has_dashboard,
  t.logo_url,
  t.network,
  t.difficulty,
  t.est_time_minutes,
  t.reward_type,
  t.reward_note,
  t.tags,
  t.total_raised_usd,
  t.short_description,
  t.highlights,
  t.prerequisites,
  t.getting_started,
  t.website_url,
  t.github_url,
  t.twitter_url,
  t.discord_url,
  t.dashboard_url,
  t.discord_roles,
  coalesce(jsonb_strip_nulls(jsonb_build_object(
    'twitter', t.twitter_url,
    'discord', t.discord_url
  )), '{}'::jsonb) as socials,
  coalesce(
    jsonb_agg(
      jsonb_strip_nulls(jsonb_build_object(
        'id', tk.id,
        'title', tk.title,
        'description', tk.description,
        'url', tk.url,
        'reward', tk.reward,
        'order', tk.order_index,
        'createdAt', tk.created_at,
        'updatedAt', tk.updated_at
      ))
      order by tk.order_index
    ) filter (where tk.id is not null),
    '[]'::jsonb
  ) as tasks
from dewrk.testnets t
left join dewrk.tasks tk on tk.testnet_id = t.id
group by t.id;
