import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/api-keys
 * Get user's API keys
 * 
 * TODO: Real implementation - create ApiKey table and store keys
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    // TODO: Real implementation
    // const apiKeys = await prisma.apiKey.findMany({
    //   where: { userId: user.id, isActive: true },
    //   orderBy: { createdAt: 'desc' }
    // });

    // MOCK DATA - Remove when real implementation is ready
    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error('[api/dashboard/api-keys]', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/dashboard/api-keys
 * Create new API key
 * 
 * TODO: Real implementation - generate secure API key and store
 */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // TODO: Real implementation
    // const apiKey = await prisma.apiKey.create({
    //   data: {
    //     userId: user.id,
    //     name,
    //     key: generateApiKey(), // Secure random key
    //     rateLimit: 100, // Default rate limit
    //     isActive: true
    //   }
    // });

    return NextResponse.json(
      { error: 'Not implemented yet', message: 'API key creation coming soon' },
      { status: 501 }
    );
  } catch (error) {
    console.error('[api/dashboard/api-keys]', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
});
