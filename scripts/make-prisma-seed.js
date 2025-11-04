// scripts/make-prisma-seed.js
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function main() {
  console.log('🔄 Prisma seed formatına dönüştürülüyor...\n');

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

  console.log(`📋 ${data.length} testnet işleniyor...\n`);

  // Prisma schema'ya uygun format
  const safe = data.map((p) => {
    // Difficulty enum mapping
    let difficulty = 'MEDIUM';
    if (p.difficulty) {
      difficulty = p.difficulty.toUpperCase();
      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        difficulty = 'MEDIUM';
      }
    }

    // Status enum mapping
    let status = 'LIVE';
    if (p.status) {
      status = p.status.toUpperCase();
      if (!['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'].includes(status)) {
        status = 'LIVE';
      }
    }

    return {
      name: p.name || 'Unknown',
      slug: p.slug || 'unknown',
      network: p.network || p.tags?.[0] || 'Unknown',
      status: status,
      difficulty: difficulty,
      shortDescription: (p.shortDescription || '').slice(0, 400),
      logoUrl: p.logoUrl || null,
      rewardType: p.rewardType || 'Points',
      rewardNote: p.rewardNote || '',
      websiteUrl: p.websiteUrl || null,
      githubUrl: p.githubUrl || null,
      twitterUrl: p.twitterUrl || null,
      discordUrl: p.discordUrl || null,
      dashboardUrl: p.dashboardUrl || null,
      hasDashboard: !!p.dashboardUrl,
      totalRaisedUSD: p.totalRaisedUSD || 0,
      kycRequired: p.kycRequired || false,
      requiresWallet: p.requiresWallet !== undefined ? p.requiresWallet : true,
      tags: p.tags || [],
      highlights: p.highlights || [],
      prerequisites: p.prerequisites || [],
      gettingStarted: p.gettingStarted || [],
      discordRoles: p.discordRoles || [],
    };
  });

  // Prisma seed formatında TypeScript dosyası oluştur
  const seedContent = `// Auto-generated seed file
// Generated at: ${new Date().toISOString()}
// Source: seed-output/testnets.json

import { PrismaClient, Difficulty, Status } from '@prisma/client';

const prisma = new PrismaClient();

const TESTNETS = ${JSON.stringify(safe, null, 2)} as Array<{
  name: string;
  slug: string;
  network: string;
  status: Status;
  difficulty: Difficulty;
  rewardType: string;
  rewardNote?: string;
  shortDescription: string;
  logoUrl?: string;
  websiteUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  dashboardUrl?: string;
  hasDashboard: boolean;
  totalRaisedUSD: number;
  kycRequired?: boolean;
  requiresWallet?: boolean;
  tags: string[];
  highlights: string[];
  prerequisites: string[];
  gettingStarted: string[];
  discordRoles?: Array<{ role: string; requirement: string; perk: string }>;
}>;

async function seedTestnets() {
  console.log('🌱 Seeding testnets...');
  await prisma.task.deleteMany();
  await prisma.testnet.deleteMany();
  
  await prisma.testnet.createMany({
    data: TESTNETS.map((testnet) => ({
      ...testnet,
      tags: testnet.tags,
      highlights: testnet.highlights,
      prerequisites: testnet.prerequisites,
      gettingStarted: testnet.gettingStarted,
      discordRoles: testnet.discordRoles ?? [],
    })),
    skipDuplicates: true,
  });
  
  console.log(\`✅ \${TESTNETS.length} testnet seeded\`);
}

async function main() {
  try {
    await seedTestnets();
  } catch (error) {
    console.error('❌ Seed failed', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  });
}

export { seedTestnets, TESTNETS };
`;

  // Prisma seed dosyasına yaz
  const seedPath = join(projectRoot, 'prisma', 'seed-generated.ts');
  await fs.writeFile(seedPath, seedContent);

  // JSON formatında da kaydet (opsiyonel)
  const jsonPath = join(projectRoot, 'seed-output', 'testnets-prisma.json');
  await fs.writeFile(jsonPath, JSON.stringify(safe, null, 2));

  console.log(`✅ Prisma seed dosyası oluşturuldu: prisma/seed-generated.ts`);
  console.log(`✅ JSON format: seed-output/testnets-prisma.json\n`);
  console.log(`📊 Özet:`);
  console.log(`   - Toplam: ${safe.length}`);
  console.log(`   - Status: ${safe.filter((s) => s.status === 'LIVE').length} LIVE`);
  console.log(`   - Logo: ${safe.filter((s) => s.logoUrl).length}`);
  console.log(`   - Dashboard: ${safe.filter((s) => s.hasDashboard).length}`);
  console.log(`   - Funding: ${safe.filter((s) => s.totalRaisedUSD > 0).length}\n`);
  console.log(`\n💡 Kullanım:`);
  console.log(`   Bu dosyayı mevcut prisma/seed.ts ile birleştirebilir veya`);
  console.log(`   ayrı bir seed script olarak çalıştırabilirsiniz.`);
  console.log(`\n   Örnek: tsx prisma/seed-generated.ts`);
}

main().catch((e) => {
  console.error('❌ Prisma seed generation hatası:', e);
  process.exit(1);
});

