#!/usr/bin/env tsx
/**
 * Quick Production Database Deployment
 * 
 * Bu script production veritabanına migration ve seed yapar.
 * DIRECT_URL environment variable gereklidir.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log('🚀 Production Database Deployment Starting...\n');

  // DIRECT_URL'i environment variable'dan veya command line arg'tan al
  let directUrl = process.env.DIRECT_URL;
  const dbUrl = process.env.DATABASE_URL;
  
  // Eğer DIRECT_URL yoksa ve command line arg varsa kullan
  if (!directUrl && process.argv[2]) {
    directUrl = process.argv[2];
    console.log('ℹ️  Using DIRECT_URL from command line argument\n');
  }

  if (!directUrl && !dbUrl) {
    console.error('❌ DIRECT_URL or DATABASE_URL environment variable not found!');
    console.error('   Please define DIRECT_URL or DATABASE_URL in .env file.');
    process.exit(1);
  }

  // DIRECT_URL varsa onu kullan, yoksa DATABASE_URL'den türet
  let migrationUrl = directUrl;
  
  if (!migrationUrl && dbUrl) {
    // Pooler URL'den direct URL'e çevir
    // Format: postgres.REF@aws-X-REGION.pooler.supabase.com:6543
    // -> postgres@db.REF.supabase.co:5432
    try {
      const url = new URL(dbUrl);
      const username = url.username;
      const hostname = url.hostname;
      const port = url.port || '6543';
      
      // postgres.REF formatından REF'i çıkar
      const refMatch = username.match(/^postgres\.(.+)$/);
      const ref = refMatch ? refMatch[1] : username.replace('postgres.', '');
      
      // Hostname'den direct hostname oluştur
      // aws-1-ap-southeast-1.pooler.supabase.com -> db.REF.supabase.co
      const directHostname = `db.${ref}.supabase.co`;
      
      // Direct URL oluştur
      const directUrlObj = new URL(dbUrl);
      directUrlObj.username = 'postgres';
      directUrlObj.hostname = directHostname;
      directUrlObj.port = '5432';
      directUrlObj.searchParams.delete('pgbouncer');
      directUrlObj.searchParams.delete('connection_limit');
      if (!directUrlObj.searchParams.has('sslmode')) {
        directUrlObj.searchParams.set('sslmode', 'require');
      }
      
      migrationUrl = directUrlObj.toString();
      console.log(`ℹ️  Converted DATABASE_URL to DIRECT_URL format\n`);
    } catch (error) {
      console.error('❌ Could not convert DATABASE_URL to DIRECT_URL:', error);
      migrationUrl = null;
    }
  }
  
  if (!migrationUrl) {
    console.error('❌ DIRECT_URL required for migration (pooler cannot be used)!');
    console.error('   Please add DIRECT_URL to .env file.');
    console.error('   Format: postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require');
    process.exit(1);
  }

  console.log(`📊 Environment: ${process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'}`);
  console.log(`🔌 Using: ${migrationUrl.includes(':5432') ? 'DIRECT (5432)' : 'Pooler (6543)'}\n`);

  try {
    // Step 1: Migration
    console.log('1️⃣ Prisma migrations applying...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = migrationUrl;
      
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
        env: process.env,
        timeout: 120000,
        cwd: process.cwd(),
      });

      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.error(stderr);

      process.env.DATABASE_URL = originalEnv || process.env.DATABASE_URL;
      console.log('✅ Migration completed\n');
    } catch (error: any) {
      if (error.message.includes('already applied') || error.message.includes('No pending migrations')) {
        console.log('ℹ️  Migration already applied\n');
      } else {
        console.error('❌ Migration error:', error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout);
        if (error.stderr) console.error('STDERR:', error.stderr);
        throw error;
      }
    }

    // Step 2: Generate Prisma Client
    console.log('2️⃣ Generating Prisma Client...');
    try {
      const { stdout, stderr } = await execAsync('npx prisma generate', {
        timeout: 60000,
        cwd: process.cwd(),
      });
      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.error(stderr);
      console.log('✅ Prisma Client generated\n');
    } catch (error: any) {
      console.error('❌ Generate error:', error.message);
      throw error;
    }

    // Step 3: Seed
    console.log('3️⃣ Seeding database...');
    try {
      // Seed script'i direkt import et ve çalıştır
      process.env.DATABASE_URL = migrationUrl;
      process.env.SEED_AUTO_DISCONNECT = 'false';

      const seedModule = await import('../prisma/seed');
      if (typeof seedModule.main === 'function') {
        await seedModule.main();
        console.log('✅ Seed completed\n');
      } else {
        throw new Error('Seed main function not found');
      }
    } catch (error: any) {
      console.error('❌ Seed error:', error.message);
      if (error.stack) console.error(error.stack);
      throw error;
    }

    // Step 4: Verify
    console.log('4️⃣ Verifying database...');
    const [testnetCount, ecosystemCount, leaderboardCount] = await Promise.all([
      prisma.testnet.count().catch(() => 0),
      prisma.ecosystem.count().catch(() => 0),
      prisma.leaderboard.count().catch(() => 0),
    ]);

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Testnets: ${testnetCount}`);
    console.log(`   ✅ Ecosystems: ${ecosystemCount}`);
    console.log(`   ✅ Leaderboards: ${leaderboardCount}`);

    if (testnetCount > 0) {
      console.log('\n🎉 Deployment successful! Data loaded to production.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Warning: Testnet count is 0. Seed may have failed.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

