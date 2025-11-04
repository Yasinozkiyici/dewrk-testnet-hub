// scripts/generate-seed.mjs
import fs from 'fs/promises';
import fetch from 'node-fetch';
import slugify from 'slugify';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const LIMIT = pLimit(6); // paralel istek sınırlama

// Known funding amounts (USD) - manually researched
const FUNDING_MAP = {
  'scroll.io': 83000000,
  'mantle.xyz': 3000000000,
  'fuel.network': 80000000,
  'zksync.io': 458000000,
  'linea.build': 725000000,
  'starknet.io': 282000000,
  'optimism.io': 178000000,
  'base.org': 100000000,
  'arbitrum.io': 120000000,
  'sui.io': 336000000,
  'aptos.dev': 400000000,
  'solana.com': 3350000000,
  'celestia.org': 55000000,
  'celo.org': 56000000,
  'frax.finance': 525000000,
  'polygon.technology': 451000000,
  'blast.io': 20000000,
  'mode.network': 15000000,
  'taiko.xyz': 100000000,
  'zora.co': 50000000,
  'metis.io': 100000000,
  'loopring.org': 45000000,
  'dydx.exchange': 87000000,
  'immutable.com': 500000000,
  'worldcoin.org': 250000000,
};

// Initial candidate list — başlangıç için popüler projeler
const initialCandidates = [
  'https://scroll.io',
  'https://mantle.xyz',
  'https://fuel.network',
  'https://zksync.io',
  'https://linea.build',
  'https://starknet.io',
  'https://optimism.io',
  'https://base.org',
  'https://arbitrum.io',
  'https://sui.io',
  'https://aptos.dev',
  'https://solana.com',
  'https://celestia.org',
  'https://celo.org',
  'https://frax.finance',
  'https://polygon.technology',
  'https://blast.io',
  'https://mode.network',
  'https://taiko.xyz',
  'https://zora.co',
  'https://metis.io',
  'https://loopring.org',
  'https://dydx.exchange',
  'https://immutable.com',
  'https://worldcoin.org',
];

// DefiLlama'dan candidate listesi al
async function fetchDefiLlamaCandidates() {
  try {
    console.log('📡 DefiLlama protocols listesi alınıyor...');
    const resp = await fetch('https://api.llama.fi/protocols');
    if (!resp.ok) {
      console.warn('⚠️  DefiLlama API yanıt vermedi, initial list kullanılıyor');
      return [];
    }
    const arr = await resp.json();
    // Layer2, zk, Rollup kategorilerinde filtrele
    const candidates = arr
      .filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return /layer|l2|rollup|zk|sidechain|modular/i.test(cat);
      })
      .slice(0, 80)
      .map((p) => {
        if (p.url && p.url.startsWith('http')) return p.url;
        if (p.gecko_id) return `https://www.coingecko.com/en/coins/${p.gecko_id}`;
        return null;
      })
      .filter(Boolean);
    console.log(`✅ DefiLlama'dan ${candidates.length} candidate bulundu`);
    return candidates;
  } catch (err) {
    console.warn('⚠️  DefiLlama fetch hatası:', err.message);
    return [];
  }
}

// Helper: fetch site metadata
async function fetchSiteMeta(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', timeout: 15000 });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';
    const desc =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      '';
    const logo =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      null;
    return {
      title: title.trim(),
      desc: desc.trim(),
      logo: logo ? new URL(logo, url).href : null,
    };
  } catch (err) {
    console.warn('⚠️  site meta failed', url, err.message);
    return null;
  }
}

// Helper: try get github url from site
async function findGithubFromSite(url) {
  try {
    const res = await fetch(url, { timeout: 15000 });
    const html = await res.text();
    const $ = cheerio.load(html);
    // GitHub linklerini ara
    const githubLink = $('a[href*="github.com"]')
      .toArray()
      .map((el) => $(el).attr('href'))
      .find((href) => href && /github\.com\/[\w\-]+\/?$/.test(href.split('?')[0]));
    if (githubLink) {
      const clean = githubLink.split('?')[0].replace(/\/$/, '');
      return clean.startsWith('http') ? clean : `https://${clean}`;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Helper: get coingecko market data by slug/name
async function fetchCoinGeckoInfo(query) {
  try {
    const search = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    if (!search.ok) return null;
    const data = await search.json();
    if (data?.coins?.length) {
      const coin = data.coins[0];
      // Coin details al
      const detailRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false`
      );
      if (detailRes.ok) {
        const detail = await detailRes.json();
        return {
          ...coin,
          description: detail?.description?.en || '',
          twitter_handle: detail?.links?.twitter_screen_name || null,
        };
      }
      return coin;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Helper: defillama protocol funding
async function fetchDefiLlamaProtocol(slugOrName) {
  try {
    const res = await fetch(
      `https://api.llama.fi/protocol/${encodeURIComponent(slugOrName)}`
    );
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Validate URL returns 200? also returns finalUrl
async function validateUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      timeout: 10000,
    });
    if (res.ok) return { ok: true, url: res.url };
    // fallback GET
    const r2 = await fetch(url, { redirect: 'follow', timeout: 12000 });
    return { ok: r2.ok, url: r2.url };
  } catch (err) {
    return { ok: false, url };
  }
}

// Logo harvesting
async function downloadLogo(logoUrl, slug) {
  try {
    if (!logoUrl) return null;
    const logoRes = await fetch(logoUrl, { timeout: 15000 });
    if (!logoRes.ok) return null;
    const contentType = logoRes.headers.get('content-type') || '';
    let ext = 'png';
    if (contentType.includes('svg')) ext = 'svg';
    else if (contentType.includes('jpg') || contentType.includes('jpeg')) ext = 'jpg';
    else if (contentType.includes('webp')) ext = 'webp';
    else {
      const urlExt = logoUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
      if (['svg', 'png', 'jpg', 'jpeg', 'webp'].includes(urlExt)) ext = urlExt;
    }
    const logosDir = join(projectRoot, 'public', 'logos');
    await fs.mkdir(logosDir, { recursive: true });
    const file = join(logosDir, `${slug}.${ext}`);
    const buffer = await logoRes.arrayBuffer();
    await fs.writeFile(file, Buffer.from(buffer));
    return `/logos/${slug}.${ext}`;
  } catch (e) {
    console.warn(`⚠️  Logo indirme hatası (${slug}):`, e.message);
    return null;
  }
}

// Reward type detection (Galxe/Zealy/Crew3)
async function detectRewardType(siteUrl, html) {
  try {
    if (!html) {
      const res = await fetch(siteUrl, { timeout: 15000 }).catch(() => null);
      if (!res?.ok) return 'Points';
      html = await res.text();
    }
    const lower = html.toLowerCase();
    if (/galxe|zealy|crew3|quest|airdrop/i.test(lower)) {
      if (/galxe/i.test(lower)) return 'Points (Galxe)';
      if (/zealy/i.test(lower)) return 'Points (Zealy)';
      if (/crew3/i.test(lower)) return 'Points (Crew3)';
      return 'Points';
    }
    return 'Points';
  } catch (e) {
    return 'Points';
  }
}

async function enrichProject(siteUrl) {
  try {
    console.log(`🔄 Enriching: ${siteUrl}`);
    const meta = await fetchSiteMeta(siteUrl);
    const github = await findGithubFromSite(siteUrl);
    const cg = await fetchCoinGeckoInfo(meta?.title || new URL(siteUrl).hostname);
    const dl = await fetchDefiLlamaProtocol(
      slugify(meta?.title || siteUrl, { lower: true })
    );
    const name = meta?.title || new URL(siteUrl).hostname.replace(/^www\./, '');
    const slug = slugify(name, { lower: true, strict: true }).replace(/\./g, '-');
    
    // Funding lookup - önce known map, sonra DefiLlama, sonra CoinGecko
    const domain = new URL(siteUrl).hostname.replace(/^www\./, '');
    let fund = FUNDING_MAP[domain] || null;
    
    if (!fund) {
      fund = dl?.treasury
        ? dl.treasury / 1
        : dl?.mcap
          ? dl.mcap
          : null;
    }
    
    // Eğer hala funding yoksa, CoinGecko'dan market cap bilgisi al (ama funding değil)
    if (!fund && cg?.market_cap_rank) {
      // Market cap bilgisi var ama funding değil, null bırak
      fund = null;
    }

    // Logo indir
    let logoPath = null;
    if (meta?.logo) {
      logoPath = await downloadLogo(meta.logo, slug);
    }

    // Reward type detection
    const rewardType = await detectRewardType(siteUrl, null);

    // Build object
    const obj = {
      name,
      slug,
      network: meta?.title?.match(/(L2|Layer 2|zkEVM|Rollup|Sidechain|L1)/i)?.[0] || meta?.title || '',
      status: 'LIVE',
      difficulty: 'MEDIUM', // Default, manual olarak güncellenebilir
      rewardType,
      rewardNote: '',
      shortDescription: meta?.desc || cg?.description?.slice(0, 300) || '',
      websiteUrl: siteUrl,
      githubUrl: github || null,
      twitterUrl: cg?.twitter_handle
        ? `https://twitter.com/${cg.twitter_handle}`
        : null,
      discordUrl: null, // Manual olarak eklenebilir
      dashboardUrl: null,
      hasDashboard: false,
      totalRaisedUSD: fund || 0,
      logoUrl: logoPath,
      tags: [],
      highlights: [],
      prerequisites: [],
      gettingStarted: [],
      discordRoles: [],
      kycRequired: false,
      requiresWallet: true,
      verified: true,
      createdAt: new Date().toISOString(),
      meta: {
        ...meta,
        coingecko: cg ? { id: cg.id, symbol: cg.symbol } : null,
        defillama: dl ? { slug: dl.slug, name: dl.name } : null,
      },
    };

    console.log(`✅ Completed: ${obj.name}`);
    return obj;
  } catch (err) {
    console.error(`❌ Error enriching ${siteUrl}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Seed pipeline başlatılıyor...\n');

  // Candidate listesi oluştur
  const defiLlamaCandidates = await fetchDefiLlamaCandidates();
  const allCandidates = [...new Set([...initialCandidates, ...defiLlamaCandidates])];
  console.log(`📋 Toplam ${allCandidates.length} candidate bulundu\n`);

  // Dedupe by domain
  const seen = new Set();
  const uniqueCandidates = allCandidates.filter((url) => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch {
      return false;
    }
  });

  console.log(`🔄 ${uniqueCandidates.length} unique candidate zenginleştiriliyor...\n`);

  const results = [];
  const tasks = uniqueCandidates.map((url) => LIMIT(() => enrichProject(url)));
  const res = await Promise.all(tasks);

  for (const r of res) {
    if (r) results.push(r);
  }

  // seed-output klasörü oluştur
  const outputDir = join(projectRoot, 'seed-output');
  await fs.mkdir(outputDir, { recursive: true });

  // JSON dosyasına yaz
  await fs.writeFile(
    join(outputDir, 'testnets.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n✅ seed-output/testnets.json oluşturuldu (${results.length} testnet)`);
  console.log(`\n📊 Özet:`);
  console.log(`   - Toplam: ${results.length}`);
  console.log(`   - Logo indirilen: ${results.filter((r) => r.logoUrl).length}`);
  console.log(`   - GitHub bulunan: ${results.filter((r) => r.githubUrl).length}`);
  console.log(`   - Twitter bulunan: ${results.filter((r) => r.twitterUrl).length}`);
  console.log(`\n🔍 Sonraki adım: pnpm seed:validate`);
}

main().catch((e) => {
  console.error('❌ Pipeline hatası:', e);
  process.exit(1);
});

