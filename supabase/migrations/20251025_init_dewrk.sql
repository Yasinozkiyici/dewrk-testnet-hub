-- Dewrk schema init migration (2025-10-25)

-- 1) Health check RPC
create or replace function public.now()
returns timestamptz
language sql
stable
security definer
as $$ select now() $$;

grant execute on function public.now() to anon, authenticated;

-- 2) Ana tablo
create extension if not exists "pgcrypto";

create table if not exists public.dewrk_testnets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  network text,
  status text,
  difficulty text,
  est_time_minutes integer,
  reward_type text,
  reward_note text,
  kyc_required boolean default false,
  requires_wallet boolean default false,
  tags text[] default '{}',
  categories text[] default '{}',
  highlights text[] default '{}',
  prerequisites text[] default '{}',
  getting_started jsonb default '[]'::jsonb,
  discord_roles jsonb default '[]'::jsonb,
  website_url text,
  github_url text,
  twitter_url text,
  discord_url text,
  dashboard_url text,
  has_dashboard boolean default false,
  logo_url text,
  hero_image_url text,
  tasks_count integer default 0,
  total_raised_usd numeric(18,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists dewrk_testnets_set_updated_at on public.dewrk_testnets;
create trigger dewrk_testnets_set_updated_at
before update on public.dewrk_testnets
for each row execute procedure public.set_updated_at();

-- 4) RLS & yetkiler
alter table public.dewrk_testnets enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.dewrk_testnets to service_role;

-- 5) LIST view
drop view if exists public.dewrk_v_testnets_list;
create view public.dewrk_v_testnets_list as
select
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.est_time_minutes as "estTimeMinutes",
  t.reward_type as "rewardType",
  t.reward_note as "rewardNote",
  t.kyc_required as "kycRequired",
  t.tags,
  t.tasks_count as "tasksCount",
  t.updated_at as "updated",
  t.total_raised_usd as "totalRaisedUSD",
  t.has_dashboard as "hasDashboard",
  t.logo_url as "logoUrl"
from public.dewrk_testnets t;

grant select on public.dewrk_v_testnets_list to anon, authenticated;

-- 6) DETAIL view
drop view if exists public.dewrk_v_testnet_detail;
create view public.dewrk_v_testnet_detail as
select
  t.slug,
  t.name,
  t.network,
  t.status,
  t.difficulty,
  t.est_time_minutes as "estTimeMinutes",
  t.reward_type as "rewardType",
  t.reward_note as "rewardNote",
  t.kyc_required as "kycRequired",
  t.requires_wallet as "requiresWallet",
  t.tags,
  t.categories,
  t.highlights,
  t.prerequisites,
  t.getting_started as "gettingStarted",
  jsonb_build_object(
    'websiteUrl', t.website_url,
    'githubUrl',  t.github_url,
    'twitterUrl', t.twitter_url,
    'discordUrl', t.discord_url
  ) as socials,
  t.dashboard_url as "dashboardUrl",
  t.has_dashboard as "hasDashboard",
  t.total_raised_usd as "totalRaisedUSD",
  t.discord_roles as "discordRoles",
  t.logo_url as "logoUrl",
  t.hero_image_url as "heroImageUrl",
  t.tasks_count as "tasksCount",
  t.updated_at as "updated",
  t.created_at as "created"
from public.dewrk_testnets t;

grant select on public.dewrk_v_testnet_detail to anon, authenticated;

-- Seed örneği (idempotent)
INSERT INTO public.dewrk_testnets (slug, name, status, network, tasks_count)
VALUES ('citrea', 'Citrea', 'LIVE', 'Bitcoin L2', 7)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    network = EXCLUDED.network,
    tasks_count = EXCLUDED.tasks_count;

-- 8) Schema cache yenile
select pg_notify('pgrst','reload schema');
