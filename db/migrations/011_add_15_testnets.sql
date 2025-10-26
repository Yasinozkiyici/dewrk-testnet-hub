-- 011_add_15_testnets.sql
-- 15 yeni testnet projesi ekleme migration'ı

-- 1. Arbitrum Nova Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'arbitrum-nova-testnet',
    'Arbitrum Nova Testnet',
    'Arbitrum',
    'LIVE',
    'EASY',
    'Arbitrum Nova test ağında dApp geliştirme ve test etme.',
    'Arbitrum Nova, Arbitrum''un AnyTrust teknolojisini kullanan yeni bir L2 çözümüdür. Düşük maliyetli ve hızlı işlemler sunar.',
    '/logos/arbitrum.svg',
    60,
    'ARB',
    'Test tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer2","evm","arbitrum","anytrust"]'::jsonb,
    '["DeFi","Gaming","NFT"]'::jsonb,
    '["Düşük maliyet","Hızlı finalite","EVM uyumlu"]'::jsonb,
    '["Metamask cüzdan","Temel Solidity bilgisi"]'::jsonb,
    '["Arbitrum Nova ağını cüzdana ekle","Test tokenları al","Basit bir dApp deploy et"]'::jsonb,
    'https://nova.arbitrum.io',
    'https://github.com/OffchainLabs',
    'https://x.com/arbitrum',
    'https://discord.gg/arbitrum',
    'https://nova.arbitrum.io/dashboard',
    true,
    3200000,
    '[{"role":"Nova Builder","requirement":"En az 3 işlem yap","perks":"Özel Discord kanalı erişimi"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'arbitrum-nova-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Ağı cüzdana ekle','Test tokenları al','Basit dApp deploy et']::text[] as task_titles,
      array['Arbitrum Nova ağını Metamask''a ekle','Faucet''ten test tokenları al','Hello World dApp''i deploy et']::text[] as task_descriptions,
      array['https://docs.arbitrum.io/nova','https://faucet.arbitrum.io','https://docs.arbitrum.io/nova/quickstart']::text[] as task_urls,
      array['100 ARB','50 ARB','Nova Builder rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 2. Polygon zkEVM Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'polygon-zkevm-testnet',
    'Polygon zkEVM Testnet',
    'Polygon',
    'LIVE',
    'MEDIUM',
    'Zero-knowledge EVM uyumlu test ağında geliştirme.',
    'Polygon zkEVM, Ethereum''a tam uyumlu zero-knowledge proof tabanlı L2 çözümüdür.',
    '/logos/polygon.svg',
    120,
    'MATIC',
    'Test MATIC ve geliştirici NFT''leri.',
    false,
    true,
    '["layer2","zk","evm","polygon"]'::jsonb,
    '["DeFi","Infrastructure","Privacy"]'::jsonb,
    '["ZK proof teknolojisi","EVM uyumlu","Düşük maliyet"]'::jsonb,
    '["Solidity deneyimi","ZK proof temel bilgisi"]'::jsonb,
    '["zkEVM ağını yapılandır","Test tokenları al","ZK dApp geliştir"]'::jsonb,
    'https://zkevm.polygon.technology',
    'https://github.com/0xPolygonHermez',
    'https://x.com/0xPolygon',
    'https://discord.gg/polygon',
    'https://bridge.zkevm.polygon.technology',
    true,
    4500000,
    '[{"role":"zkEVM Pioneer","requirement":"ZK dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'polygon-zkevm-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['zkEVM ağını yapılandır','Test tokenları al','ZK dApp geliştir']::text[] as task_titles,
      array['Polygon zkEVM testnet ağını cüzdana ekle','Faucet''ten test MATIC al','Basit ZK dApp deploy et']::text[] as task_descriptions,
      array['https://docs.zkevm.polygon.technology','https://faucet.zkevm.polygon.technology','https://docs.zkevm.polygon.technology/quickstart']::text[] as task_urls,
      array['200 MATIC','100 MATIC','zkEVM Pioneer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 3. Optimism Goerli Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'optimism-goerli-testnet',
    'Optimism Goerli Testnet',
    'Optimism',
    'LIVE',
    'EASY',
    'Optimism L2 test ağında hızlı ve ucuz işlemler.',
    'Optimism, Ethereum''un optimistic rollup çözümüdür. Hızlı ve düşük maliyetli işlemler sunar.',
    '/logos/optimism.svg',
    45,
    'OP',
    'Test OP tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer2","optimistic-rollup","ethereum"]'::jsonb,
    '["DeFi","Infrastructure","Gaming"]'::jsonb,
    '["Hızlı işlemler","Düşük maliyet","EVM uyumlu"]'::jsonb,
    '["Metamask cüzdan","Temel blockchain bilgisi"]'::jsonb,
    '["Optimism ağını ekle","Test tokenları al","İşlem yap"]'::jsonb,
    'https://optimism.io',
    'https://github.com/ethereum-optimism',
    'https://x.com/optimism',
    'https://discord.gg/optimism',
    'https://app.optimism.io',
    true,
    2800000,
    '[{"role":"Optimism Builder","requirement":"5 işlem yap","perks":"Özel Discord erişimi"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'optimism-goerli-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Optimism ağını ekle','Test tokenları al','İşlem yap']::text[] as task_titles,
      array['Optimism Goerli ağını cüzdana ekle','Faucet''ten test OP al','Basit bir işlem gerçekleştir']::text[] as task_descriptions,
      array['https://docs.optimism.io','https://faucet.optimism.io','https://docs.optimism.io/quickstart']::text[] as task_urls,
      array['50 OP','25 OP','Optimism Builder rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 4. Starknet Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'starknet-testnet',
    'Starknet Testnet',
    'Starknet',
    'LIVE',
    'HARD',
    'Starknet''te Cairo ile dApp geliştirme.',
    'Starknet, zk-STARK teknolojisi kullanan L2 çözümüdür. Cairo programlama dili ile geliştirme yapılır.',
    '/logos/starknet.svg',
    180,
    'STRK',
    'Test STRK tokenları ve geliştirici NFT''leri.',
    false,
    true,
    '["layer2","zk-stark","cairo","scaling"]'::jsonb,
    '["DeFi","Infrastructure","Privacy"]'::jsonb,
    '["ZK-STARK teknolojisi","Cairo dili","Yüksek throughput"]'::jsonb,
    '["Cairo programlama","ZK proof temel bilgisi"]'::jsonb,
    '["Cairo kurulumu yap","Test tokenları al","Cairo dApp geliştir"]'::jsonb,
    'https://starknet.io',
    'https://github.com/starkware-libs',
    'https://x.com/starknet',
    'https://discord.gg/starknet',
    'https://starknet.io/ecosystem',
    true,
    5200000,
    '[{"role":"Starknet Developer","requirement":"Cairo dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'starknet-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Cairo kurulumu yap','Test tokenları al','Cairo dApp geliştir']::text[] as task_titles,
      array['Cairo CLI ve Starknet cüzdanını kur','Faucet''ten test STRK al','Basit Cairo dApp deploy et']::text[] as task_descriptions,
      array['https://docs.starknet.io','https://faucet.starknet.io','https://docs.starknet.io/quickstart']::text[] as task_urls,
      array['500 STRK','250 STRK','Starknet Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 5. Avalanche Fuji Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'avalanche-fuji-testnet',
    'Avalanche Fuji Testnet',
    'Avalanche',
    'LIVE',
    'MEDIUM',
    'Avalanche Fuji test ağında hızlı ve ölçeklenebilir dApp geliştirme.',
    'Avalanche, yüksek throughput ve düşük latency sunan L1 blockchain platformudur.',
    '/logos/avalanche.svg',
    90,
    'AVAX',
    'Test AVAX tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","avalanche","evm","scaling"]'::jsonb,
    '["DeFi","Infrastructure","Gaming"]'::jsonb,
    '["Yüksek throughput","Düşük latency","EVM uyumlu"]'::jsonb,
    '["Solidity deneyimi","Avalanche temel bilgisi"]'::jsonb,
    '["Avalanche ağını yapılandır","Test tokenları al","dApp geliştir"]'::jsonb,
    'https://avax.network',
    'https://github.com/ava-labs',
    'https://x.com/avalancheavax',
    'https://discord.gg/avalanche',
    'https://app.avax.network',
    true,
    3800000,
    '[{"role":"Avalanche Builder","requirement":"dApp deploy et","perks":"Özel Discord kanalı"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'avalanche-fuji-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Avalanche ağını yapılandır','Test tokenları al','dApp geliştir']::text[] as task_titles,
      array['Fuji testnet ağını cüzdana ekle','Faucet''ten test AVAX al','Basit dApp deploy et']::text[] as task_descriptions,
      array['https://docs.avax.network','https://faucet.avax.network','https://docs.avax.network/quickstart']::text[] as task_urls,
      array['100 AVAX','50 AVAX','Avalanche Builder rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 6. BSC Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'bsc-testnet',
    'BSC Testnet',
    'BSC',
    'LIVE',
    'EASY',
    'Binance Smart Chain test ağında dApp geliştirme.',
    'BSC, Binance''in EVM uyumlu blockchain platformudur. Düşük maliyetli işlemler sunar.',
    '/logos/bsc.svg',
    30,
    'BNB',
    'Test BNB tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","bsc","evm","binance"]'::jsonb,
    '["DeFi","Infrastructure","Trading"]'::jsonb,
    '["Düşük maliyet","Hızlı işlemler","EVM uyumlu"]'::jsonb,
    '["Metamask cüzdan","Temel blockchain bilgisi"]'::jsonb,
    '["BSC ağını ekle","Test tokenları al","İşlem yap"]'::jsonb,
    'https://bscscan.com',
    'https://github.com/bnb-chain',
    'https://x.com/bnbchain',
    'https://discord.gg/bnbchain',
    'https://testnet.bscscan.com',
    true,
    1500000,
    '[{"role":"BSC Developer","requirement":"3 işlem yap","perks":"Özel Discord erişimi"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'bsc-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['BSC ağını ekle','Test tokenları al','İşlem yap']::text[] as task_titles,
      array['BSC testnet ağını cüzdana ekle','Faucet''ten test BNB al','Basit bir işlem gerçekleştir']::text[] as task_descriptions,
      array['https://docs.bnbchain.org','https://testnet.bnbchain.org/faucet','https://docs.bnbchain.org/quickstart']::text[] as task_urls,
      array['10 BNB','5 BNB','BSC Developer rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 7. Fantom Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'fantom-testnet',
    'Fantom Testnet',
    'Fantom',
    'LIVE',
    'MEDIUM',
    'Fantom Opera test ağında hızlı ve düşük maliyetli dApp geliştirme.',
    'Fantom, yüksek performanslı ve EVM uyumlu blockchain platformudur.',
    '/logos/fantom.svg',
    75,
    'FTM',
    'Test FTM tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","fantom","evm","dpos"]'::jsonb,
    '["DeFi","Infrastructure","Gaming"]'::jsonb,
    '["Yüksek performans","Düşük maliyet","EVM uyumlu"]'::jsonb,
    '["Solidity deneyimi","Fantom temel bilgisi"]'::jsonb,
    '["Fantom ağını yapılandır","Test tokenları al","dApp geliştir"]'::jsonb,
    'https://fantom.foundation',
    'https://github.com/Fantom-Foundation',
    'https://x.com/fantomfdn',
    'https://discord.gg/fantom',
    'https://testnet.ftmscan.com',
    true,
    2200000,
    '[{"role":"Fantom Builder","requirement":"dApp deploy et","perks":"Özel Discord kanalı"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'fantom-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Fantom ağını yapılandır','Test tokenları al','dApp geliştir']::text[] as task_titles,
      array['Fantom testnet ağını cüzdana ekle','Faucet''ten test FTM al','Basit dApp deploy et']::text[] as task_descriptions,
      array['https://docs.fantom.foundation','https://faucet.fantom.network','https://docs.fantom.foundation/quickstart']::text[] as task_urls,
      array['100 FTM','50 FTM','Fantom Builder rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 8. Solana Devnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'solana-devnet',
    'Solana Devnet',
    'Solana',
    'LIVE',
    'HARD',
    'Solana devnet''te Rust ile dApp geliştirme.',
    'Solana, yüksek performanslı ve düşük maliyetli blockchain platformudur. Rust programlama dili kullanır.',
    '/logos/solana.svg',
    240,
    'SOL',
    'Test SOL tokenları ve geliştirici NFT''leri.',
    false,
    true,
    '["layer1","solana","rust","high-performance"]'::jsonb,
    '["DeFi","Infrastructure","Gaming","NFT"]'::jsonb,
    '["Yüksek performans","Düşük maliyet","Rust dili"]'::jsonb,
    '["Rust programlama","Solana temel bilgisi"]'::jsonb,
    '["Solana CLI kur","Test tokenları al","Rust dApp geliştir"]'::jsonb,
    'https://solana.com',
    'https://github.com/solana-labs',
    'https://x.com/solana',
    'https://discord.gg/solana',
    'https://explorer.solana.com',
    true,
    6800000,
    '[{"role":"Solana Developer","requirement":"Rust dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'solana-devnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Solana CLI kur','Test tokenları al','Rust dApp geliştir']::text[] as task_titles,
      array['Solana CLI ve cüzdanını kur','Faucet''ten test SOL al','Basit Rust dApp deploy et']::text[] as task_descriptions,
      array['https://docs.solana.com','https://faucet.solana.com','https://docs.solana.com/quickstart']::text[] as task_urls,
      array['10 SOL','5 SOL','Solana Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 9. NEAR Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'near-testnet',
    'NEAR Testnet',
    'NEAR',
    'LIVE',
    'MEDIUM',
    'NEAR testnet''te Rust ile dApp geliştirme.',
    'NEAR, geliştirici dostu ve ölçeklenebilir blockchain platformudur.',
    '/logos/near.svg',
    120,
    'NEAR',
    'Test NEAR tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","near","rust","sharding"]'::jsonb,
    '["DeFi","Infrastructure","Gaming","NFT"]'::jsonb,
    '["Geliştirici dostu","Ölçeklenebilir","Rust dili"]'::jsonb,
    '["Rust programlama","NEAR temel bilgisi"]'::jsonb,
    '["NEAR CLI kur","Test tokenları al","Rust dApp geliştir"]'::jsonb,
    'https://near.org',
    'https://github.com/near',
    'https://x.com/nearprotocol',
    'https://discord.gg/near',
    'https://explorer.testnet.near.org',
    true,
    3500000,
    '[{"role":"NEAR Builder","requirement":"dApp deploy et","perks":"Özel Discord kanalı"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'near-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['NEAR CLI kur','Test tokenları al','Rust dApp geliştir']::text[] as task_titles,
      array['NEAR CLI ve cüzdanını kur','Faucet''ten test NEAR al','Basit Rust dApp deploy et']::text[] as task_descriptions,
      array['https://docs.near.org','https://faucet.near.org','https://docs.near.org/quickstart']::text[] as task_urls,
      array['50 NEAR','25 NEAR','NEAR Builder rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 10. Cosmos Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'cosmos-testnet',
    'Cosmos Testnet',
    'Cosmos',
    'LIVE',
    'HARD',
    'Cosmos testnet''te Go ile dApp geliştirme.',
    'Cosmos, modüler ve bağlantılı blockchain ekosistemidir.',
    '/logos/cosmos.svg',
    300,
    'ATOM',
    'Test ATOM tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","cosmos","go","ibc","modular"]'::jsonb,
    '["Infrastructure","DeFi","Interoperability"]'::jsonb,
    '["Modüler yapı","IBC protokolü","Go dili"]'::jsonb,
    '["Go programlama","Cosmos temel bilgisi"]'::jsonb,
    '["Cosmos CLI kur","Test tokenları al","Go dApp geliştir"]'::jsonb,
    'https://cosmos.network',
    'https://github.com/cosmos',
    'https://x.com/cosmos',
    'https://discord.gg/cosmos',
    'https://explorer.cosmos.network',
    true,
    4200000,
    '[{"role":"Cosmos Developer","requirement":"Go dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'cosmos-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Cosmos CLI kur','Test tokenları al','Go dApp geliştir']::text[] as task_titles,
      array['Cosmos CLI ve cüzdanını kur','Faucet''ten test ATOM al','Basit Go dApp deploy et']::text[] as task_descriptions,
      array['https://docs.cosmos.network','https://faucet.cosmos.network','https://docs.cosmos.network/quickstart']::text[] as task_urls,
      array['100 ATOM','50 ATOM','Cosmos Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 11. Polkadot Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'polkadot-testnet',
    'Polkadot Testnet',
    'Polkadot',
    'LIVE',
    'HARD',
    'Polkadot testnet''te Rust ile parachain geliştirme.',
    'Polkadot, çoklu blockchain ağını birbirine bağlayan platformdur.',
    '/logos/polkadot.svg',
    360,
    'DOT',
    'Test DOT tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer0","polkadot","rust","parachain","substrate"]'::jsonb,
    '["Infrastructure","DeFi","Interoperability"]'::jsonb,
    '["Parachain teknolojisi","Substrate framework","Rust dili"]'::jsonb,
    '["Rust programlama","Substrate temel bilgisi"]'::jsonb,
    '["Substrate CLI kur","Test tokenları al","Parachain geliştir"]'::jsonb,
    'https://polkadot.network',
    'https://github.com/paritytech',
    'https://x.com/polkadot',
    'https://discord.gg/polkadot',
    'https://polkadot.js.org/apps',
    true,
    5800000,
    '[{"role":"Polkadot Developer","requirement":"Parachain deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'polkadot-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Substrate CLI kur','Test tokenları al','Parachain geliştir']::text[] as task_titles,
      array['Substrate CLI ve cüzdanını kur','Faucet''ten test DOT al','Basit parachain deploy et']::text[] as task_descriptions,
      array['https://docs.substrate.io','https://faucet.polkadot.network','https://docs.substrate.io/quickstart']::text[] as task_urls,
      array['500 DOT','250 DOT','Polkadot Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 12. Cardano Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'cardano-testnet',
    'Cardano Testnet',
    'Cardano',
    'LIVE',
    'HARD',
    'Cardano testnet''te Plutus ile dApp geliştirme.',
    'Cardano, bilimsel yaklaşımla geliştirilen blockchain platformudur.',
    '/logos/cardano.svg',
    420,
    'ADA',
    'Test ADA tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","cardano","haskell","plutus","proof-of-stake"]'::jsonb,
    '["DeFi","Infrastructure","Gaming","NFT"]'::jsonb,
    '["Bilimsel yaklaşım","Plutus dili","Haskell"]'::jsonb,
    '["Haskell programlama","Plutus temel bilgisi"]'::jsonb,
    '["Cardano CLI kur","Test tokenları al","Plutus dApp geliştir"]'::jsonb,
    'https://cardano.org',
    'https://github.com/input-output-hk',
    'https://x.com/cardano',
    'https://discord.gg/cardano',
    'https://explorer.cardano.org',
    true,
    7200000,
    '[{"role":"Cardano Developer","requirement":"Plutus dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'cardano-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Cardano CLI kur','Test tokenları al','Plutus dApp geliştir']::text[] as task_titles,
      array['Cardano CLI ve cüzdanını kur','Faucet''ten test ADA al','Basit Plutus dApp deploy et']::text[] as task_descriptions,
      array['https://docs.cardano.org','https://faucet.cardano.org','https://docs.cardano.org/quickstart']::text[] as task_urls,
      array['1000 ADA','500 ADA','Cardano Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 13. Algorand Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'algorand-testnet',
    'Algorand Testnet',
    'Algorand',
    'LIVE',
    'MEDIUM',
    'Algorand testnet''te Python ile dApp geliştirme.',
    'Algorand, hızlı ve güvenli blockchain platformudur.',
    '/logos/algorand.svg',
    150,
    'ALGO',
    'Test ALGO tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","algorand","python","proof-of-stake"]'::jsonb,
    '["DeFi","Infrastructure","Gaming","NFT"]'::jsonb,
    '["Hızlı işlemler","Güvenli","Python dili"]'::jsonb,
    '["Python programlama","Algorand temel bilgisi"]'::jsonb,
    '["Algorand CLI kur","Test tokenları al","Python dApp geliştir"]'::jsonb,
    'https://algorand.com',
    'https://github.com/algorand',
    'https://x.com/algorand',
    'https://discord.gg/algorand',
    'https://testnet.algoexplorer.io',
    true,
    3100000,
    '[{"role":"Algorand Developer","requirement":"Python dApp deploy et","perks":"Özel Discord kanalı"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'algorand-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Algorand CLI kur','Test tokenları al','Python dApp geliştir']::text[] as task_titles,
      array['Algorand CLI ve cüzdanını kur','Faucet''ten test ALGO al','Basit Python dApp deploy et']::text[] as task_descriptions,
      array['https://docs.algorand.com','https://faucet.algorand.com','https://docs.algorand.com/quickstart']::text[] as task_urls,
      array['200 ALGO','100 ALGO','Algorand Developer rozeti']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 14. Tezos Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'tezos-testnet',
    'Tezos Testnet',
    'Tezos',
    'LIVE',
    'HARD',
    'Tezos testnet''te Michelson ile dApp geliştirme.',
    'Tezos, kendi kendini güncelleyebilen blockchain platformudur.',
    '/logos/tezos.svg',
    270,
    'XTZ',
    'Test XTZ tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","tezos","michelson","proof-of-stake"]'::jsonb,
    '["DeFi","Infrastructure","Gaming","NFT"]'::jsonb,
    '["Kendi kendini güncelleme","Michelson dili","Formal verification"]'::jsonb,
    '["Michelson programlama","Tezos temel bilgisi"]'::jsonb,
    '["Tezos CLI kur","Test tokenları al","Michelson dApp geliştir"]'::jsonb,
    'https://tezos.com',
    'https://github.com/tezos',
    'https://x.com/tezos',
    'https://discord.gg/tezos',
    'https://testnet.tzstats.com',
    true,
    4800000,
    '[{"role":"Tezos Developer","requirement":"Michelson dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'tezos-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Tezos CLI kur','Test tokenları al','Michelson dApp geliştir']::text[] as task_titles,
      array['Tezos CLI ve cüzdanını kur','Faucet''ten test XTZ al','Basit Michelson dApp deploy et']::text[] as task_descriptions,
      array['https://docs.tezos.com','https://faucet.tezos.com','https://docs.tezos.com/quickstart']::text[] as task_urls,
      array['500 XTZ','250 XTZ','Tezos Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;

-- 15. Filecoin Testnet
with upserted as (
  insert into dewrk.testnets (
    slug, name, network, status, difficulty, short_description, description,
    logo_url, est_time_minutes, reward_type, reward_note,
    kyc_required, requires_wallet, tags, categories, highlights, prerequisites, getting_started,
    website_url, github_url, twitter_url, discord_url, dashboard_url, has_dashboard,
    total_raised_usd, discord_roles
  ) values (
    'filecoin-testnet',
    'Filecoin Testnet',
    'Filecoin',
    'LIVE',
    'HARD',
    'Filecoin testnet''te depolama ve veri yönetimi.',
    'Filecoin, merkezi olmayan depolama ağıdır.',
    '/logos/filecoin.svg',
    480,
    'FIL',
    'Test FIL tokenları ve geliştirici rozetleri.',
    false,
    true,
    '["layer1","filecoin","storage","ipfs","proof-of-storage"]'::jsonb,
    '["Infrastructure","Storage","Data"]'::jsonb,
    '["Merkezi olmayan depolama","IPFS entegrasyonu","Proof of Storage"]'::jsonb,
    '["IPFS deneyimi","Filecoin temel bilgisi"]'::jsonb,
    '["Filecoin CLI kur","Test tokenları al","Depolama dApp geliştir"]'::jsonb,
    'https://filecoin.io',
    'https://github.com/filecoin-project',
    'https://x.com/filecoin',
    'https://discord.gg/filecoin',
    'https://filscan.io',
    true,
    6200000,
    '[{"role":"Filecoin Developer","requirement":"Depolama dApp deploy et","perks":"Özel hackathon davetleri"}]'::jsonb
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
  select id from dewrk.testnets where slug = 'filecoin-testnet'
)
insert into dewrk.tasks (testnet_id, title, description, url, reward, order_index)
select id, unnest(task_titles), unnest(task_descriptions), unnest(task_urls), unnest(task_rewards), unnest(task_orders)
from upserted,
  lateral (
    select 
      array['Filecoin CLI kur','Test tokenları al','Depolama dApp geliştir']::text[] as task_titles,
      array['Filecoin CLI ve cüzdanını kur','Faucet''ten test FIL al','Basit depolama dApp deploy et']::text[] as task_descriptions,
      array['https://docs.filecoin.io','https://faucet.filecoin.io','https://docs.filecoin.io/quickstart']::text[] as task_urls,
      array['1000 FIL','500 FIL','Filecoin Developer NFT']::text[] as task_rewards,
      array[0,1,2]::int[] as task_orders
  ) payload
on conflict do nothing;