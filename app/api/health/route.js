import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Health check endpoint to verify database connectivity
 */
export async function GET(request) {
  try {
    const startTime = Date.now();

    // Check environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    };

    // Try to connect to database
    let dbConnected = false;
    let dbConnectionTime = 0;
    let dbError = null;

    try {
      const dbStart = Date.now();
      await dbConnect();
      dbConnected = true;
      dbConnectionTime = Date.now() - dbStart;
    } catch (error) {
      dbError = error.message;
    }

    // Try to fetch count from listings
    let listingCount = 0;
    let listingError = null;

    if (dbConnected) {
      try {
        listingCount = await Listing.countDocuments({}).limit(1);
      } catch (error) {
        listingError = error.message;
      }
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connected: dbConnected,
        connectionTimeMs: dbConnectionTime,
        error: dbError,
        listingCount,
        listingError,
      },
      totalTimeMs: totalTime,
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
