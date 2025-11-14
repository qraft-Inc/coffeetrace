import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Lot from '../../../../models/Lot';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lots/[traceId]
 * Get a lot by its trace ID (public endpoint for QR codes)
 */
export async function GET(request, { params }) {
  try {
    // Safety guard for build time
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    await dbConnect();
    const { traceId } = params;

    const lot = await Lot.findOne({ traceId })
      .populate('farmerId', 'name location farmSize altitude certifications')
      .populate('cooperativeId', 'name location')
      .populate({
        path: 'events.actor',
        select: 'name role',
      })
      .lean();

    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    // Sort events by timestamp
    lot.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return NextResponse.json({ lot });
  } catch (error) {
    console.error('GET /api/lots/[traceId] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lot', details: error.message },
      { status: 500 }
    );
  }
}
