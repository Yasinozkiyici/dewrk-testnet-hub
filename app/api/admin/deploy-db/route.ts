import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Admin-only endpoint to deploy migrations and seed data to production
 * POST /api/admin/deploy-db
 * 
 * Requires: ADMIN_SECRET env variable
 */
export async function POST(request: Request) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'ADMIN_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json().catch(() => ({}));

    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    };

    // 1. Run Prisma migrations (using exec as Prisma CLI is needed)
    if (!action || action === 'migrate') {
      try {
        console.log('[deploy-db] Running Prisma migrations...');
        const { stdout, stderr } = await execAsync(
          'npx prisma migrate deploy',
          {
            env: {
              ...process.env,
              DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
            },
            timeout: 120000, // 2 minutes
            cwd: process.cwd(),
          }
        );
        
        results.migration = {
          success: true,
          stdout: stdout.slice(0, 1000), // Limit output
          stderr: stderr.slice(0, 1000),
        };
        
        console.log('[deploy-db] Migration completed');
      } catch (error: any) {
        results.migration = {
          success: false,
          error: error.message,
          stdout: error.stdout?.slice(0, 1000),
          stderr: error.stderr?.slice(0, 1000),
        };
        
        // Don't fail if migration is already applied
        if (!error.message.includes('already applied') && !error.message.includes('No pending migrations')) {
          console.error('[deploy-db] Migration error:', error.message);
        }
      }
    }

    // 2. Generate Prisma Client
    try {
      console.log('[deploy-db] Generating Prisma Client...');
      const { stdout, stderr } = await execAsync(
        'npx prisma generate',
        {
          timeout: 60000,
          cwd: process.cwd(),
        }
      );
      
      results.generate = {
        success: true,
        stdout: stdout.slice(0, 1000),
        stderr: stderr.slice(0, 1000),
      };
      
      console.log('[deploy-db] Prisma Client generated');
    } catch (error: any) {
      results.generate = {
        success: false,
        error: error.message,
        stdout: error.stdout?.slice(0, 1000),
        stderr: error.stderr?.slice(0, 1000),
      };
    }

    // 3. Seed data - Direct import instead of exec
    if (!action || action === 'seed') {
      try {
        console.log('[deploy-db] Seeding database...');
        
        // Use DIRECT_URL for seeding to avoid pooler limitations
        const originalDbUrl = process.env.DATABASE_URL;
        if (process.env.DIRECT_URL && process.env.DATABASE_URL?.includes('pooler')) {
          process.env.DATABASE_URL = process.env.DIRECT_URL;
        }

        // Import and run seed script directly
        // Note: We need to use dynamic import to avoid build-time issues
        process.env.SEED_AUTO_DISCONNECT = 'false'; // Don't disconnect, we'll manage it
        const seedModule = await import('@/prisma/seed');
        const seedMain = (seedModule as any).main;
        
        if (typeof seedMain === 'function') {
          await seedMain();
          results.seed = {
            success: true,
            message: 'Seed completed via direct import',
          };
        } else {
          // Fallback: use exec
          const { stdout, stderr } = await execAsync(
            'npx tsx prisma/seed.ts',
            {
              env: process.env,
              timeout: 180000, // 3 minutes for seed
              cwd: process.cwd(),
            }
          );

          results.seed = {
            success: true,
            stdout: stdout.slice(0, 2000),
            stderr: stderr.slice(0, 1000),
          };
        }

        // Restore original DATABASE_URL
        if (originalDbUrl) {
          process.env.DATABASE_URL = originalDbUrl;
        }

        console.log('[deploy-db] Seed completed');
      } catch (error: any) {
        results.seed = {
          success: false,
          error: error.message,
          stdout: error.stdout?.slice(0, 2000),
          stderr: error.stderr?.slice(0, 2000),
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };
        
        // Don't fail completely if seed has issues
        console.error('[deploy-db] Seed error:', error.message);
      }
    }

    // 4. Verify data
    try {
      const [testnetCount, ecosystemCount, leaderboardCount] = await Promise.all([
        prisma.testnet.count().catch(() => 0),
        prisma.ecosystem.count().catch(() => 0),
        prisma.leaderboard.count().catch(() => 0),
      ]);

      results.verification = {
        testnetCount,
        ecosystemCount,
        leaderboardCount,
        success: testnetCount > 0 || ecosystemCount > 0 || leaderboardCount > 0,
      };
    } catch (error: any) {
      results.verification = {
        success: false,
        error: error.message,
      };
    }

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

