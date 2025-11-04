// scripts/enrich-existing-testnets.mjs
// Mevcut testnetlerin eksik bilgilerini toplar ve günceller
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const prisma = new PrismaClient();
const LIMIT = pLimit(3); // Rate limiting için

// Bilinen funding miktarları (USD)
const FUNDING_MAP = {
  'scroll.io': 83000000,
  'mantle.xyz': 3000000000,
  'fuel.network': 80000000,
  'zksync.io': 458000000,
  'linea.build': 725000000,
  'starknet.io': 282000000,
  'optimism.io': 178000000,
  'base.org': 520580000,
  'arbitrum.io': 123700000,
  'sui.io': 336000000,
  'aptos.dev': 400000000,
  'solana.com': 3350000000,
  'celestia.org': 55000000,
  'celo.org': 66500000,
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

// DefiLlama'dan protocol bilgisi al
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

// Status belirleme mantığı
function determineStatus(testnet) {
  // Eğer zaten status varsa ve LIVE değilse koru
  if (testnet.status && testnet.status !== 'LIVE') {
    return testnet.status;
  }
  
  // startDate kontrolü
  if (testnet.startDate) {
    const startDate = new Date(testnet.startDate);
    const now = new Date();
    
    if (startDate > now) {
      return 'UPCOMING';
    }
  }
  
  // Website'den "ended", "closed", "paused" gibi kelimeleri kontrol et
  // Bu bilgiyi metadata'dan alabiliriz
  
  // Default: LIVE
  return 'LIVE';
}

// Site metadata çekme
async function fetchSiteMeta(url) {
  try {
    const res = await fetch(url, { 
      redirect: 'follow', 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
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
      $('link[rel="apple-touch-icon"]').attr('href') ||
      null;
    
    // GitHub linkini bul
    const githubLink = $('a[href*="github.com"]')
      .toArray()
      .map((el) => $(el).attr('href'))
      .find((href) => href && /github\.com\/[\w\-]+\/?$/.test(href.split('?')[0]));
    
    // Twitter linkini bul
    const twitterLink = $('a[href*="twitter.com"], a[href*="x.com"]')
      .toArray()
      .map((el) => $(el).attr('href'))
      .find((href) => href && /(twitter\.com|x\.com)\//.test(href));
    
    // Discord linkini bul
    const discordLink = $('a[href*="discord"]')
      .toArray()
      .map((el) => $(el).attr('href'))
      .find((href) => href && /discord\.(gg|com)/.test(href));
    
    return {
      title: title.trim(),
      desc: desc.trim(),
      logo: logo ? new URL(logo, url).href : null,
      github: githubLink ? (githubLink.startsWith('http') ? githubLink : `https://${githubLink}`) : null,
      twitter: twitterLink ? (twitterLink.startsWith('http') ? twitterLink : `https://${twitterLink}`) : null,
      discord: discordLink ? (discordLink.startsWith('http') ? discordLink : `https://${discordLink}`) : null,
    };
  } catch (err) {
    console.warn(`⚠️  Site meta failed for ${url}:`, err.message);
    return null;
  }
}

// CoinGecko'dan bilgi al
async function fetchCoinGeckoInfo(query) {
  try {
    const search = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    if (!search.ok) return null;
    const data = await search.json();
    if (data?.coins?.length) {
      const coin = data.coins[0];
      const detailRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=false`
      );
      if (detailRes.ok) {
        const detail = await detailRes.json();
        return {
          ...coin,
          description: detail?.description?.en || '',
          twitter_handle: detail?.links?.twitter_screen_name || null,
          github_url: detail?.links?.repos_url?.github?.[0] || null,
        };
      }
      return coin;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Logo indir
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
    const fs = await import('fs/promises');
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

// Tek bir testnet'i zenginleştir
async function enrichTestnet(testnet) {
  try {
    console.log(`\n🔄 Enriching: ${testnet.name} (${testnet.slug})`);
    
    const updates = {};
    let hasUpdates = false;
    
    // Status güncellemesi - sadece LIVE ise kontrol et
    if (testnet.status === 'LIVE' || !testnet.status) {
      const newStatus = determineStatus(testnet);
      if (newStatus !== testnet.status) {
        updates.status = newStatus;
        hasUpdates = true;
        console.log(`  ✅ Status güncellendi: ${testnet.status} → ${newStatus}`);
      }
    }
    
    // Funding bilgisi - sadece null veya 0 ise güncelle
    if (!testnet.totalRaisedUSD || testnet.totalRaisedUSD === 0) {
      let funding = null;
      const domain = testnet.websiteUrl ? new URL(testnet.websiteUrl).hostname.replace(/^www\./, '') : null;
      
      // 1. Bilinen funding map'ten kontrol
      if (domain && FUNDING_MAP[domain]) {
        funding = FUNDING_MAP[domain];
        console.log(`  ✅ Funding map'ten bulundu: $${funding.toLocaleString()}`);
      } else {
        // 2. DefiLlama'dan kontrol
        const dl = await fetchDefiLlamaProtocol(testnet.name || domain || testnet.slug);
        if (dl) {
          funding = dl.treasury ? dl.treasury : (dl.mcap ? dl.mcap : null);
          if (funding) {
            console.log(`  ✅ DefiLlama'dan bulundu: $${funding.toLocaleString()}`);
          }
        }
      }
      
      if (funding && funding > 0) {
        updates.totalRaisedUSD = funding;
        hasUpdates = true;
      }
    }
    
    // Website URL varsa metadata çek
    if (testnet.websiteUrl) {
      const meta = await fetchSiteMeta(testnet.websiteUrl);
      if (meta) {
        // Logo yoksa veya clearbit URL'si ise yeni logo indir
        if (!testnet.logoUrl || testnet.logoUrl.includes('logo.clearbit.com')) {
          if (meta.logo) {
            const logoPath = await downloadLogo(meta.logo, testnet.slug);
            if (logoPath) {
              updates.logoUrl = logoPath;
              hasUpdates = true;
              console.log(`  ✅ Logo güncellendi: ${logoPath}`);
            }
          }
        }
        
        // GitHub yoksa ekle
        if (!testnet.githubUrl && meta.github) {
          updates.githubUrl = meta.github;
          hasUpdates = true;
          console.log(`  ✅ GitHub eklendi: ${meta.github}`);
        }
        
        // Twitter yoksa ekle
        if (!testnet.twitterUrl && meta.twitter) {
          updates.twitterUrl = meta.twitter;
          hasUpdates = true;
          console.log(`  ✅ Twitter eklendi: ${meta.twitter}`);
        }
        
        // Discord yoksa ekle
        if (!testnet.discordUrl && meta.discord) {
          updates.discordUrl = meta.discord;
          hasUpdates = true;
          console.log(`  ✅ Discord eklendi: ${meta.discord}`);
        }
        
        // Short description yoksa veya çok kısa ise ekle
        if ((!testnet.shortDescription || testnet.shortDescription.length < 50) && meta.desc) {
          updates.shortDescription = meta.desc.slice(0, 300);
          hasUpdates = true;
          console.log(`  ✅ Short description güncellendi`);
        }
      }
    }
    
    // CoinGecko'dan bilgi al (sadece logo, github, twitter eksikse)
    if (testnet.websiteUrl && (!testnet.logoUrl || !testnet.githubUrl || !testnet.twitterUrl)) {
      const domain = new URL(testnet.websiteUrl).hostname.replace(/^www\./, '');
      const cg = await fetchCoinGeckoInfo(testnet.name || domain);
      if (cg) {
        // Logo yoksa CoinGecko'dan al
        if (!testnet.logoUrl || testnet.logoUrl.includes('logo.clearbit.com')) {
          if (cg.large) {
            const logoPath = await downloadLogo(cg.large, testnet.slug);
            if (logoPath) {
              updates.logoUrl = logoPath;
              hasUpdates = true;
              console.log(`  ✅ Logo CoinGecko'dan eklendi`);
            }
          }
        }
        
        // GitHub yoksa CoinGecko'dan al
        if (!testnet.githubUrl && cg.github_url) {
          updates.githubUrl = cg.github_url;
          hasUpdates = true;
          console.log(`  ✅ GitHub CoinGecko'dan eklendi`);
        }
        
        // Twitter yoksa CoinGecko'dan al
        if (!testnet.twitterUrl && cg.twitter_handle) {
          updates.twitterUrl = `https://twitter.com/${cg.twitter_handle}`;
          hasUpdates = true;
          console.log(`  ✅ Twitter CoinGecko'dan eklendi`);
        }
      }
    }
    
    if (hasUpdates) {
      await prisma.testnet.update({
        where: { id: testnet.id },
        data: updates
      });
      console.log(`  ✅ ${testnet.name} güncellendi`);
      return true;
    } else {
      console.log(`  ⏭️  ${testnet.name} güncelleme gerekmiyor`);
      return false;
    }
  } catch (err) {
    console.error(`  ❌ Error enriching ${testnet.name}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Mevcut testnetler zenginleştiriliyor...\n');
  
  try {
    // Tüm testnetleri al
    const testnets = await prisma.testnet.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`📋 Toplam ${testnets.length} testnet bulundu\n`);
    
    // Eksik bilgileri olanları filtrele
    const needsEnrichment = testnets.filter((t) => {
      return !t.logoUrl || 
             !t.githubUrl || 
             !t.twitterUrl || 
             !t.discordUrl ||
             t.logoUrl.includes('logo.clearbit.com') ||
             (t.shortDescription && t.shortDescription.length < 50) ||
             !t.totalRaisedUSD ||
             t.totalRaisedUSD === 0 ||
             (t.status === 'LIVE' && !t.startDate); // Status kontrolü için
    });
    
    console.log(`🔄 ${needsEnrichment.length} testnet zenginleştirme gerektiriyor\n`);
    
    // Paralel olarak zenginleştir (rate limit ile)
    const tasks = needsEnrichment.map((testnet) => LIMIT(() => enrichTestnet(testnet)));
    const results = await Promise.all(tasks);
    
    const updated = results.filter(Boolean).length;
    
    console.log(`\n✅ Tamamlandı!`);
    console.log(`   - Toplam testnet: ${testnets.length}`);
    console.log(`   - Zenginleştirilen: ${updated}`);
    console.log(`   - Değişiklik olmayan: ${needsEnrichment.length - updated}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Pipeline hatası:', e);
  process.exit(1);
});

