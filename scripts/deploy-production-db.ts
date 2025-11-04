#!/usr/bin/env tsx
/**
 * Production Database Deployment Script
 * 
 * This script:
 * 1. Applies Prisma migrations to production
 * 2. Generates Prisma Client
 * 3. Seeds the database with testnet data
 * 
 * Usage:
 *   pnpm tsx scripts/deploy-production-db.ts
 * 
 * Required env vars:
 *   - DIRECT_URL (for migrations)
 *   - DATABASE_URL (for runtime)
 *   - ADMIN_SECRET (for API endpoint authentication)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);

const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
});

async function runCommand(command: string, description: string, timeout = 120000) {
  console.log(`\n🔄 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        // Use DIRECT_URL for migrations
        DATABASE_URL: command.includes('migrate') 
          ? (process.env.DIRECT_URL || process.env.DATABASE_URL)
          : process.env.DATABASE_URL,
      },
      timeout,
    });
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) console.error(stderr);
    
    return { success: true, stdout, stderr };
  } catch (error: any) {
    console.error(`❌ ${description} failed:`, error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.error('STDERR:', error.stderr);
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

async function verifyDatabase() {
  console.log('\n🔍 Verifying database...');
  try {
    const [testnetCount, ecosystemCount, leaderboardCount] = await Promise.all([
      prisma.testnet.count().catch(() => 0),
      prisma.ecosystem.count().catch(() => 0),
      prisma.leaderboard.count().catch(() => 0),
    ]);

    console.log(`\n📊 Database Status:`);
    console.log(`   - Testnets: ${testnetCount}`);
    console.log(`   - Ecosystems: ${ecosystemCount}`);
    console.log(`   - Leaderboards: ${leaderboardCount}`);

    return {
      testnetCount,
      ecosystemCount,
      leaderboardCount,
      success: testnetCount > 0 || ecosystemCount > 0 || leaderboardCount > 0,
    };
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Production Database Deployment\n');
  console.log(`Environment: ${process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`Direct URL: ${process.env.DIRECT_URL ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    console.error('❌ DATABASE_URL or DIRECT_URL must be set');
    process.exit(1);
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  };

  // Step 1: Run migrations
  const migrationResult = await runCommand(
    'pnpm prisma migrate deploy',
    'Applying Prisma migrations',
    120000
  );
  results.migration = migrationResult;

  if (!migrationResult.success && !migrationResult.error?.includes('already applied')) {
    console.error('\n❌ Migration failed. Stopping deployment.');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Step 2: Generate Prisma Client
  const generateResult = await runCommand(
    'pnpm prisma generate',
    'Generating Prisma Client',
    60000
  );
  results.generate = generateResult;

  // Step 3: Seed database
  // Use DIRECT_URL for seeding to avoid pooler limitations
  const originalDbUrl = process.env.DATABASE_URL;
  if (process.env.DIRECT_URL && !process.env.DATABASE_URL?.includes('pooler')) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
  }

  const seedResult = await runCommand(
    'pnpm db:seed',
    'Seeding database',
    180000
  );
  results.seed = seedResult;

  // Restore original DATABASE_URL
  if (originalDbUrl) {
    process.env.DATABASE_URL = originalDbUrl;
  }

  // Step 4: Verify
  const verification = await verifyDatabase();
  results.verification = verification;

  await prisma.$disconnect();

  // Summary
  console.log('\n\n📋 Deployment Summary:');
  console.log(`   Migration: ${migrationResult.success ? '✅' : '❌'}`);
  console.log(`   Generate: ${generateResult.success ? '✅' : '❌'}`);
  console.log(`   Seed: ${seedResult.success ? '✅' : '❌'}`);
  console.log(`   Verification: ${verification.success ? '✅' : '❌'}`);

  if (verification.success) {
    console.log('\n✅ Deployment completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Deployment completed with warnings. Check logs above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

