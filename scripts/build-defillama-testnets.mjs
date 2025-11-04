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
const DATA_FILE = path.join(OUTPUT_DIR, 'testnets.json');

const ALLOWED_CATEGORIES = new Set([
  'Chain',
  'Cross Chain Bridge',
  'Canonical Bridge',
  'Chain Bribes'
]);

const limit = pLimit(5);

const headers = {
  accept: 'application/json',
  'user-agent': 'Mozilla/5.0 (compatible; DewrkBot/1.0; +https://dewrk.com)'
};

function formatUSD(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function buildPrerequisites(name, website) {
  const items = [];
  if (website) items.push(`Visit ${website} to review ${name} documentation`);
  items.push('Configure a compatible wallet (MetaMask, Ledger, Rabby)');
  items.push('Bridge or request test assets to interact with on-chain features');
  return items;
}

function buildGettingStarted(name, explorer) {
  const items = [];
  items.push(`Deploy a sample smart contract or application on ${name}`);
  if (explorer) items.push(`Track transactions via ${explorer}`);
  items.push('Share feedback with the community to qualify for incentives or grants');
  return items;
}

async function downloadLogo(url, slug) {
  if (!url) return null;
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`⚠️  Logo request failed (${response.status}) for ${slug}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    const cleanUrl = url.split('?')[0];
    const extMatch = cleanUrl.match(/\.([a-zA-Z0-9]{2,5})$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
    const filename = `${slug}.${ext}`;
    await fs.mkdir(LOGO_DIR, { recursive: true });
    await fs.writeFile(path.join(LOGO_DIR, filename), Buffer.from(buffer));
    return `/logos/${filename}`;
  } catch (error) {
    console.warn(`⚠️  Logo download error for ${slug}:`, error.message);
    return null;
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('📡 Fetching protocol metadata from DefiLlama...');
  const res = await fetch('https://api.llama.fi/protocols', { headers });
  if (!res.ok) {
    throw new Error(`Failed to load protocols: ${res.status}`);
  }
  const protocols = await res.json();
  const filtered = protocols
    .filter((protocol) => ALLOWED_CATEGORIES.has(protocol.category))
    .sort((a, b) => (Number(b.tvl || 0) - Number(a.tvl || 0)));

  console.log(`✅ Found ${filtered.length} protocols in target categories`);

  const dataset = [];

  for (const protocol of filtered) {
    if (dataset.length >= 140) break;

    const website = protocol.url?.startsWith('http') ? protocol.url : null;
    if (!website) continue;

    const tvl = Number(protocol.tvl || protocol.mcap || 0);
    if (!Number.isFinite(tvl) || tvl <= 0) continue;

    const slug = slugify(protocol.slug || protocol.name, { lower: true, strict: true });
    const tags = Array.from(
      new Set([
        protocol.category,
        ...(Array.isArray(protocol.chains) ? protocol.chains : [])
      ])
    ).slice(0, 8);

    const explorer = Array.isArray(protocol.openSourceUrl)
      ? protocol.openSourceUrl.find((url) => url.includes('scan') || url.includes('explorer'))
      : null;

    const logoPath = await downloadLogo(protocol.logo, slug);

    dataset.push({
      name: protocol.name,
      slug,
      network: protocol.chain ?? (protocol.chains?.[0] ?? protocol.category ?? 'Multi-chain'),
      status: 'LIVE',
      difficulty: 'MEDIUM',
      rewardType: 'Tokens',
      rewardNote: null,
      shortDescription: protocol.description ?? `${protocol.name} ecosystem`,
      websiteUrl: website,
      githubUrl: null,
      twitterUrl: protocol.twitter ? `https://twitter.com/${protocol.twitter.replace('@', '')}` : null,
      discordUrl: null,
      dashboardUrl: explorer ?? null,
      hasDashboard: Boolean(explorer),
      totalRaisedUSD: tvl,
      tags,
      highlights: [
        ...(formatUSD(protocol.tvl) ? [`TVL: $${formatUSD(protocol.tvl)}`] : []),
        ...(formatUSD(protocol.mcap) ? [`MCap: $${formatUSD(protocol.mcap)}`] : []),
        protocol.category ? `${protocol.category} category` : null
      ].filter(Boolean).slice(0, 3),
      prerequisites: buildPrerequisites(protocol.name, website),
      gettingStarted: buildGettingStarted(protocol.name, explorer || website),
      discordRoles: [],
      hasFaucet: false,
      kycRequired: false,
      requiresWallet: true,
      rewardCategory: null,
      rewardRangeUSD: null,
      estTimeMinutes: 30,
      logoUrl: logoPath ?? protocol.logo ?? null,
      createdAt: new Date().toISOString()
    });
  }

  const unique = dataset.filter((item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index);
  const final = unique.slice(0, 120);

  await fs.writeFile(DATA_FILE, JSON.stringify(final, null, 2), 'utf8');
  console.log(`📁 Wrote ${final.length} entries to ${DATA_FILE}`);
}

main().catch((error) => {
  console.error('❌ Failed to build dataset', error);
  process.exit(1);
});
