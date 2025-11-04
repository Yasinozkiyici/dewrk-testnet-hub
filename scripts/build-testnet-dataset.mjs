import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import slugify from 'slugify';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const OUTPUT_DIR = path.join(projectRoot, 'seed-output');
const LOGO_DIR = path.join(projectRoot, 'public', 'logos');

const categories = [
  'layer-2',
  'layer-1',
  'rollup',
  'modular-blockchain',
  'zero-knowledge',
  'scaling',
  'bridge',
];

const limit = pLimit(2);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCategory(category) {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('category', category);
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', '250');
  url.searchParams.set('page', '1');
  url.searchParams.set('price_change_percentage', '24h');

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; DewrkBot/1.0; +https://dewrk.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to load category ${category}: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

async function fetchCoinDetail(id) {
  const url = new URL(`https://api.coingecko.com/api/v3/coins/${id}`);
  url.searchParams.set('localization', 'false');
  url.searchParams.set('tickers', 'false');
  url.searchParams.set('market_data', 'true');
  url.searchParams.set('community_data', 'false');
  url.searchParams.set('developer_data', 'false');
  url.searchParams.set('sparkline', 'false');

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; DewrkBot/1.0; +https://dewrk.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to load coin ${id}: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

function stripHtml(input = '') {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeById(items) {
  const map = new Map();
  for (const item of items) {
    if (!item || !item.id) continue;
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

function pickHighlightEntries(detail) {
  const highlights = [];
  if (detail.market_data?.fully_diluted_valuation?.usd) {
    highlights.push(
      `FDV: $${Number(detail.market_data.fully_diluted_valuation.usd).toLocaleString('en-US')}`
    );
  }
  if (detail.market_data?.total_volume?.usd) {
    highlights.push(
      `24h Volume: $${Number(detail.market_data.total_volume.usd).toLocaleString('en-US')}`
    );
  }
  if (detail.hashing_algorithm) {
    highlights.push(`${detail.hashing_algorithm} consensus`);
  }
  if (detail.categories?.includes('Layer 2')) {
    highlights.push('Layer 2 scaling');
  }
  return highlights.slice(0, 3);
}

function inferDifficulty(categories = []) {
  const lower = categories.map((c) => c.toLowerCase());
  if (lower.some((c) => c.includes('testnet') || c.includes('dev'))) return 'EASY';
  if (lower.some((c) => c.includes('layer 2') || c.includes('rollup') || c.includes('zk'))) return 'MEDIUM';
  return 'HARD';
}

function inferRewardType(categories = []) {
  const lower = categories.map((c) => c.toLowerCase());
  if (lower.some((c) => c.includes('airdrop') || c.includes('points'))) return 'Points';
  return 'Tokens';
}

function buildPrerequisites(name, website) {
  const items = [];
  if (website) items.push(`Review the official ${name} documentation at ${website}`);
  items.push('Configure a compatible wallet (MetaMask, Rabby, or hardware)');
  items.push('Fund the wallet with test assets using the community faucet or bridge');
  return items;
}

function buildGettingStarted(name, website) {
  const items = [];
  items.push(`Deploy a sample contract or dApp on ${name}`);
  items.push(`Submit a transaction and inspect it via the explorer linked on ${website || 'the official docs'}`);
  items.push('Join the community channel and share feedback or bug reports');
  return items;
}

function extractDiscord(links) {
  const candidates = [...(links?.chat_url ?? []), ...(links?.official_forum_url ?? [])];
  return candidates.find((url) => typeof url === 'string' && url.includes('discord')) || null;
}

async function downloadLogo(url, slug) {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; DewrkBot/1.0; +https://dewrk.com)'
      }
    });
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const extMatch = url.split('?')[0].match(/\.([a-zA-Z0-9]{2,5})$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
    const filename = `${slug}.${ext}`;
    await fs.mkdir(LOGO_DIR, { recursive: true });
    await fs.writeFile(path.join(LOGO_DIR, filename), Buffer.from(buffer));
    return `/logos/${filename}`;
  } catch (error) {
    console.warn(`⚠️  Logo download failed for ${slug}:`, error.message);
    return null;
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('📊 Fetching category listings from CoinGecko...');
  const categoryResults = await Promise.all(
    categories.map(async (category) => {
      try {
        const data = await fetchCategory(category);
        console.log(`  • ${category}: ${data.length} entries`);
        return data;
      } catch (error) {
        console.warn(`⚠️  Failed to load category ${category}:`, error.message);
        return [];
      }
    })
  );

  const merged = dedupeById(categoryResults.flat());
  const sorted = merged
    .filter((coin) => typeof coin.market_cap_rank === 'number' && coin.market_cap_rank > 0)
    .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
    .slice(0, 140);

  console.log(`✅ Collected ${sorted.length} unique candidates`);

  const dataset = [];
  let processed = 0;

  for (const coin of sorted) {
    if (dataset.length >= 110) break;
    try {
      await sleep(1200); // respect API limits
      const detail = await fetchCoinDetail(coin.id);
      processed += 1;

      const slug = slugify(detail.id, { lower: true, strict: true });
      const website = detail.links?.homepage?.find((url) => url && url.startsWith('http')) ?? null;
      if (!website) {
        console.warn(`⚠️  Skipping ${detail.name} due to missing website`);
        continue;
      }

      const marketCap = Number(detail.market_data?.market_cap?.usd ?? 0);
      if (!Number.isFinite(marketCap) || marketCap <= 0) {
        console.warn(`⚠️  Skipping ${detail.name} due to missing market cap`);
        continue;
      }

      const categories = Array.isArray(detail.categories) ? detail.categories.filter(Boolean) : [];
      const description = stripHtml(detail.description?.en ?? '').slice(0, 420);
      const githubUrl = detail.links?.repos_url?.github?.find((url) => url && url.startsWith('http')) ?? null;
      const twitterHandle = detail.links?.twitter_screen_name ?? '';
      const twitterUrl = twitterHandle ? `https://twitter.com/${twitterHandle}` : null;
      const discordUrl = extractDiscord(detail.links);
      const explorer = detail.links?.blockchain_site?.find((url) => url && url.startsWith('http')) ?? null;
      const logoUrl = await downloadLogo(detail.image?.large ?? detail.image?.thumb, slug);

      dataset.push({
        name: detail.name,
        slug,
        network: categories[0] || 'Blockchain',
        status: 'LIVE',
        difficulty: inferDifficulty(categories),
        rewardType: inferRewardType(categories),
        rewardNote: null,
        shortDescription: description || `${detail.name} ecosystem project`,
        websiteUrl: website,
        githubUrl,
        twitterUrl,
        discordUrl,
        dashboardUrl: explorer,
        hasDashboard: Boolean(explorer),
        totalRaisedUSD: marketCap,
        tags: categories.slice(0, 6),
        highlights: pickHighlightEntries(detail),
        prerequisites: buildPrerequisites(detail.name, website),
        gettingStarted: buildGettingStarted(detail.name, website),
        discordRoles: [],
        hasFaucet: categories.some((c) => c.toLowerCase().includes('testnet') || c.toLowerCase().includes('layer 2')),
        kycRequired: false,
        requiresWallet: true,
        rewardCategory: null,
        rewardRangeUSD: null,
        estTimeMinutes: 45,
        logoUrl: logoUrl ?? (website ? `https://logo.clearbit.com/${new URL(website).hostname}` : null),
        createdAt: new Date().toISOString()
      });

      console.log(`   → Processed #${processed}: ${detail.name}`);
    } catch (error) {
      console.warn(`⚠️  Failed to process ${coin.id}:`, error.message);
    }
  }

  const sliced = dataset.slice(0, 110);
  await fs.writeFile(path.join(OUTPUT_DIR, 'testnets.json'), JSON.stringify(sliced, null, 2), 'utf8');
  console.log(`
🎉 Generated dataset for ${sliced.length} projects -> seed-output/testnets.json`);
}

main().catch((error) => {
  console.error('❌ Dataset generation failed', error);
  process.exit(1);
});
