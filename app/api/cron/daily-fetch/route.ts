/**
 * Daily Literature Fetch Cron Job
 *
 * This endpoint should be called by a cron service daily.
 *
 * Setup options:
 * 1. Vercel Cron Jobs: Add to vercel.json
 * 2. GitHub Actions: Schedule workflow
 * 3. External cron service (cron-job.org, EasyCron, etc.)
 *
 * Example vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-fetch",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Verify request is from authorized source
 */
function isAuthorized(request: NextRequest): boolean {
  // Check for cron secret token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Allow Vercel Cron
  const cronHeader = request.headers.get('x-vercel-cron');
  if (cronHeader) {
    return true;
  }

  // In development, allow all
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

/**
 * GET /api/cron/daily-fetch
 * Fetches new high-impact literature and sends notifications
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const startTime = Date.now();
    console.log('Starting daily literature fetch...');

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const fetchUrl = new URL('/api/literature/fetch', baseUrl);

    // Fetch from all categories for the last day
    fetchUrl.searchParams.set('days', '1');
    fetchUrl.searchParams.set('notify', 'true'); // Send email notification

    const response = await fetch(fetchUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.statusText}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;

    console.log(`Daily fetch completed in ${duration}ms`);
    console.log(`Found ${result.count} high-impact articles`);

    return NextResponse.json({
      success: true,
      message: 'Daily fetch completed',
      duration: `${duration}ms`,
      articlesFound: result.count,
      totalFetched: result.totalFetched,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily fetch cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Daily fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/daily-fetch
 * Same as GET, allows manual triggering
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
