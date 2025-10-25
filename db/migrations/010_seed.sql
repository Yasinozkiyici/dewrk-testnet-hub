-- 010_seed.sql
-- Development seed data. Do NOT run in production environments.

-- Aurora Builders Program
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'aurora-builders-program',
    'Aurora Builders Program',
    'Aurora',
    'LIVE',
    'MEDIUM',
    'Deploy EVM compatible contracts and ship infra tooling on Aurora.',
    null,
    '/logos/aurora.svg',
    180,
    'USDC',
    'Monthly evaluation based on contribution impact.',
    false,
    true,
    '["ecosystem","evm","grants"]'::jsonb,
    '["DeFi","Infrastructure"]'::jsonb,
    '["Weekly office hours","Preferred access to Aurora Ventures"]'::jsonb,
    '["Solidity experience","Familiarity with Aurora CLI"]'::jsonb,
    '["Clone the starter repo and install dependencies.","Deploy contract using Aurora CLI to testnet.","Submit a progress report via the dashboard."]'::jsonb,
    'https://aurora.dev',
    'https://github.com/aurora-is-near',
    'https://x.com/auroraisnear',
    'https://discord.gg/aurora',
    'https://dashboard.aurora.dev',
    true,
    2500000,
    '[{"role":"Aurora Builder","requirement":"Complete at least one milestone","perks":"Private research drops"}]'::jsonb
  )
  on conflict (slug) do update set
    name = excluded.name,
    network = excluded.network,
    status = excluded.status,
    difficulty = excluded.difficulty,
    short_description = excluded.short_description,
    logo_url = excluded.logo_url,
    est_time_minutes = excluded.est_time_minutes,
    reward_type = excluded.reward_type,
    reward_note = excluded.reward_note,
    kyc_required = excluded.kyc_required,
    requires_wallet = excluded.requires_wallet,
    tags = excluded.tags,
    categories = excluded.categories,
    highlights = excluded.highlights,
    prerequisites = excluded.prerequisites,
    getting_started = excluded.getting_started,
    website_url = excluded.website_url,
    github_url = excluded.github_url,
    twitter_url = excluded.twitter_url,
    discord_url = excluded.discord_url,
    dashboard_url = excluded.dashboard_url,
    has_dashboard = excluded.has_dashboard,
    total_raised_usd = excluded.total_raised_usd,
    discord_roles = excluded.discord_roles
  returning id
)
delete from dewrk.tasks where testnet_id in (select id from upserted);

with upserted as (
  select id from dewrk.testnets where slug = 'aurora-builders-program'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Deploy starter contract','Submit onboarding form']::text[] as task_titles,
      array['Deploy contract using Aurora CLI to the public testnet.','Submit the onboarding form to gain mentor access.']::text[] as task_descriptions,
      array['https://docs.aurora.dev/deploy','https://forms.aurora.dev/onboarding']::text[] as task_urls,
      array['50 USDC','Access to mentors']::text[] as task_rewards,
      array[0,1]::int[] as task_orders
  ) payload
on conflict do nothing;

-- Celestia Data Availability Quest
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, has_dashboard,
    total_raised_usd
  ) values (
    'celestia-data-availability-quest',
    'Celestia Data Availability Quest',
    'Celestia',
    'UPCOMING',
    'HARD',
    'Benchmark modular rollup integrations with Celestia DA.',
    '/logos/celestia.svg',
    360,
    'TIA',
    'Tiered based on throughput benchmarks.',
    false,
    true,
    '["research","rollups"]'::jsonb,
    '["Infrastructure"]'::jsonb,
    '["Hardware credits","Research grants"]'::jsonb,
    '["Rust experience","Celestia light node setup"]'::jsonb,
    '["Provision a light node using the scripts provided.","Record benchmark metrics and push to the shared repo."]'::jsonb,
    'https://celestia.org',
    'https://github.com/celestiaorg',
    'https://x.com/CelestiaOrg',
    'https://discord.gg/bRyq6EK4',
    false,
    4200000
  )
  on conflict (slug) do update set
    name = excluded.name,
    network = excluded.network,
    status = excluded.status,
    difficulty = excluded.difficulty,
    short_description = excluded.short_description,
    logo_url = excluded.logo_url,
    est_time_minutes = excluded.est_time_minutes,
    reward_type = excluded.reward_type,
    reward_note = excluded.reward_note,
    kyc_required = excluded.kyc_required,
    requires_wallet = excluded.requires_wallet,
    tags = excluded.tags,
    categories = excluded.categories,
    highlights = excluded.highlights,
    prerequisites = excluded.prerequisites,
    getting_started = excluded.getting_started,
    website_url = excluded.website_url,
    github_url = excluded.github_url,
    twitter_url = excluded.twitter_url,
    discord_url = excluded.discord_url,
    has_dashboard = excluded.has_dashboard,
    total_raised_usd = excluded.total_raised_usd
  returning id
)
delete from dewrk.tasks where testnet_id in (select id from upserted);

with upserted as (
  select id from dewrk.testnets where slug = 'celestia-data-availability-quest'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Sync light node','Run benchmark suite']::text[] as task_titles,
      array[null,'Execute the benchmark scripts and capture metrics.']::text[] as task_descriptions,
      array[null,'https://github.com/celestiaorg/dev-guides']::text[] as task_urls,
      array['Role eligibility','500 TIA stipend']::text[] as task_rewards,
      array[0,1]::int[] as task_orders
  ) payload
on conflict do nothing;

-- ZkSync Contributors
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd
  ) values (
    'zksync-contributors',
    'ZkSync Contributors',
    'ZkSync',
    'LIVE',
    'EASY',
    'Create educational content and tooling for zkSync Era testnet.',
    '/logos/zksync.svg',
    90,
    'Points',
    'Redeemable for swag and event invites.',
    true,
    true,
    '["education","content"]'::jsonb,
    '["Community"]'::jsonb,
    '["Content amplification","Travel grants"]'::jsonb,
    '["Publish one tutorial"]'::jsonb,
    '["Draft an outline and submit for approval.","Record or write the tutorial and share assets."]'::jsonb,
    'https://zksync.io',
    'https://x.com/zksync',
    'https://discord.gg/zksync',
    'https://contributors.zksync.io',
    true,
    1800000
  )
  on conflict (slug) do update set
    name = excluded.name,
    network = excluded.network,
    status = excluded.status,
    difficulty = excluded.difficulty,
    short_description = excluded.short_description,
    logo_url = excluded.logo_url,
    est_time_minutes = excluded.est_time_minutes,
    reward_type = excluded.reward_type,
    reward_note = excluded.reward_note,
    kyc_required = excluded.kyc_required,
    requires_wallet = excluded.requires_wallet,
    tags = excluded.tags,
    categories = excluded.categories,
    highlights = excluded.highlights,
    prerequisites = excluded.prerequisites,
    getting_started = excluded.getting_started,
    website_url = excluded.website_url,
    twitter_url = excluded.twitter_url,
    discord_url = excluded.discord_url,
    dashboard_url = excluded.dashboard_url,
    has_dashboard = excluded.has_dashboard,
    total_raised_usd = excluded.total_raised_usd
  returning id
)
delete from dewrk.tasks where testnet_id in (select id from upserted);

with upserted as (
  select id from dewrk.testnets where slug = 'zksync-contributors'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Submit tutorial outline','Publish tutorial']::text[] as task_titles,
      array['Draft an outline and share for approval.','Publish the tutorial to the community hub.']::text[] as task_descriptions,
      array[null,null]::text[] as task_urls,
      array['Review within 48h','Content Pioneer role']::text[] as task_rewards,
      array[0,1]::int[] as task_orders
  ) payload
on conflict do nothing;
