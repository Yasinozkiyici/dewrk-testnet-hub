// scripts/validate-seed.mjs
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function checkUrl(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      timeout: 10000,
    });
    if (r.ok) return { ok: true, status: r.status, url: r.url };
    // Fallback GET
    const r2 = await fetch(url, { redirect: 'follow', timeout: 12000 });
    return { ok: r2.ok, status: r2.status, url: r2.url };
  } catch (e) {
    return { ok: false, status: 0, url, error: e.message };
  }
}

async function checkLogoExists(logoPath) {
  if (!logoPath) return false;
  try {
    const fullPath = join(projectRoot, 'public', logoPath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Seed validation başlatılıyor...\n');

  const dataPath = join(projectRoot, 'seed-output', 'testnets.json');
  let data;
  try {
    const content = await fs.readFile(dataPath, 'utf8');
    data = JSON.parse(content);
  } catch (e) {
    console.error(`❌ ${dataPath} dosyası bulunamadı veya okunamadı`);
    console.error('   Önce pnpm seed:generate çalıştırın');
    process.exit(1);
  }

  console.log(`📋 ${data.length} testnet validasyonu yapılıyor...\n`);

  const results = [];
  const warnings = [];

  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    console.log(`[${i + 1}/${data.length}] Validating: ${p.slug}`);

    const websiteCheck = await checkUrl(p.websiteUrl);
    const githubCheck = p.githubUrl ? await checkUrl(p.githubUrl) : { ok: false };
    const twitterCheck = p.twitterUrl ? await checkUrl(p.twitterUrl) : { ok: false };
    const logoExists = await checkLogoExists(p.logoUrl);

    const result = {
      slug: p.slug,
      name: p.name,
      websiteOk: websiteCheck.ok,
      websiteStatus: websiteCheck.status,
      websiteUrl: websiteCheck.url || p.websiteUrl,
      githubOk: p.githubUrl ? githubCheck.ok : null,
      githubStatus: p.githubUrl ? githubCheck.status : null,
      twitterOk: p.twitterUrl ? twitterCheck.ok : null,
      twitterStatus: p.twitterUrl ? twitterCheck.status : null,
      logoExists,
      logoUrl: p.logoUrl,
      totalRaisedUSD: p.totalRaisedUSD,
      hasDescription: !!(p.shortDescription && p.shortDescription.length > 10),
      issues: [],
    };

    // Issue detection
    if (!websiteCheck.ok) {
      result.issues.push('Website erişilemiyor');
      warnings.push(`${p.slug}: Website erişilemiyor (${p.websiteUrl})`);
    }

    if (p.githubUrl && !githubCheck.ok) {
      result.issues.push('GitHub URL erişilemiyor');
      warnings.push(`${p.slug}: GitHub URL erişilemiyor (${p.githubUrl})`);
    }

    if (p.twitterUrl && !twitterCheck.ok) {
      result.issues.push('Twitter URL erişilemiyor');
      warnings.push(`${p.slug}: Twitter URL erişilemiyor (${p.twitterUrl})`);
    }

    if (!logoExists && !p.logoUrl) {
      result.issues.push('Logo bulunamadı');
      warnings.push(`${p.slug}: Logo bulunamadı`);
    }

    if (!result.hasDescription) {
      result.issues.push('Açıklama eksik (<10 karakter)');
      warnings.push(`${p.slug}: Açıklama eksik`);
    }

    if (p.totalRaisedUSD === 0 || p.totalRaisedUSD === null) {
      result.issues.push('Funding bilgisi yok');
      warnings.push(`${p.slug}: Funding bilgisi yok (totalRaisedUSD: 0)`);
    }

    results.push(result);
  }

  // Output validation results
  const outputDir = join(projectRoot, 'seed-output');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    join(outputDir, 'validation.json'),
    JSON.stringify(results, null, 2)
  );

  // Summary
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const okCount = results.filter((r) => r.issues.length === 0).length;
  const warningCount = warnings.length;

  console.log('\n📊 Validation Özeti:');
  console.log(`   ✅ Sorunsuz: ${okCount}/${data.length}`);
  console.log(`   ⚠️  Uyarılar: ${warningCount}`);
  console.log(`   📝 Toplam issue: ${totalIssues}\n`);

  if (warnings.length > 0) {
    console.log('⚠️  Uyarılar:');
    warnings.slice(0, 20).forEach((w) => console.log(`   - ${w}`));
    if (warnings.length > 20) {
      console.log(`   ... ve ${warnings.length - 20} daha`);
    }
    console.log('');
  }

  console.log(`✅ Validation sonuçları: seed-output/validation.json`);
  console.log(`\n🔍 Sonraki adım: pnpm seed:make-prisma`);

  // Exit code based on issues
  if (warningCount > data.length * 0.5) {
    console.log('\n⚠️  Yüksek uyarı oranı (>50%), manuel kontrol önerilir');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('❌ Validation hatası:', e);
  process.exit(1);
});

