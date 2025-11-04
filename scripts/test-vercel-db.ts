#!/usr/bin/env tsx
/**
 * Test script to verify Vercel DATABASE_URL connection
 * Run with: DATABASE_URL="vercel-url" pnpm tsx scripts/test-vercel-db.ts
 */

import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

console.log('🔍 Testing DATABASE_URL connection...');
console.log('📋 URL preview:', dbUrl.substring(0, 60) + '...');
console.log('🔌 Port:', dbUrl.includes(':6543') ? '6543 (pooler)' : dbUrl.includes(':5432') ? '5432 (direct)' : 'unknown');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  },
  log: ['error', 'warn', 'info']
});

async function test() {
  try {
    console.log('\n1️⃣ Testing connection...');
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection test passed:', connectionTest);

    console.log('\n2️⃣ Counting testnets...');
    const testnetCount = await prisma.testnet.count();
    console.log(`✅ Testnet count: ${testnetCount}`);

    console.log('\n3️⃣ Counting ecosystems...');
    const ecosystemCount = await prisma.ecosystem.count();
    console.log(`✅ Ecosystem count: ${ecosystemCount}`);

    console.log('\n4️⃣ Fetching sample testnets...');
    const sampleTestnets = await prisma.testnet.findMany({
      take: 3,
      select: {
        slug: true,
        name: true,
        network: true
      }
    });
    console.log('✅ Sample testnets:');
    sampleTestnets.forEach(t => {
      console.log(`   - ${t.slug}: ${t.name} (${t.network})`);
    });

    if (testnetCount === 0) {
      console.log('\n⚠️  WARNING: Testnet count is 0!');
      console.log('   This means the database is empty or connected to wrong database.');
    } else {
      console.log('\n✅ SUCCESS: Database connection is working correctly!');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();

