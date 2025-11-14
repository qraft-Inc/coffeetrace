import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../../lib/dbConnect';
import Lot from '../../../../../models/Lot';
import AuditTrail from '../../../../../models/AuditTrail';
import { authOptions } from '../../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * POST /api/lots/[traceId]/events
 * Add a new trace event to a lot's journey
 */
export async function POST(request, { params }) {
  try {
    // Safety guard for build time
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { traceId } = params;
    const body = await request.json();

    // Validate required fields
    const { step, gps, photoUrl, note } = body;
    if (!step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      );
    }

    // Find lot
    const lot = await Lot.findOne({ traceId });
    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    // Create new event
    const newEvent = {
      step,
      timestamp: new Date(),
      actor: session.user.id,
      gps: gps ? {
        type: 'Point',
        coordinates: gps.coordinates || [],
      } : undefined,
      photoUrl,
      note,
      metadata: body.metadata || {},
    };

    // Add event to lot
    lot.events.push(newEvent);

    // Update lot status based on event step
    const statusMap = {
      'harvested': 'harvested',
      'weighed': 'harvested',
      'processed': 'processed',
      'dried': 'processed',
      'hulled': 'processed',
      'graded': 'processed',
      'bagged': 'stored',
      'stored': 'stored',
      'shipped': 'exported',
      'exported': 'exported',
      'received': 'delivered',
    };

    if (statusMap[step]) {
      lot.status = statusMap[step];
    }

    await lot.save();

    // Log event addition
    await AuditTrail.log({
      entityType: 'Lot',
      entityId: lot._id,
      action: 'trace_event_added',
      actorId: session.user.id,
      description: `Trace event added: ${step}`,
      metadata: {
        traceId,
        step,
        eventCount: lot.events.length,
      },
    });

    return NextResponse.json({
      message: 'Event added successfully',
      lot,
      event: newEvent,
    });
  } catch (error) {
    console.error('POST /api/lots/[traceId]/events error:', error);
    return NextResponse.json(
      { error: 'Failed to add event', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lots/[traceId]/events
 * Get all events for a lot
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
      .select('events traceId')
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

    // Sort events chronologically
    lot.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return NextResponse.json({
      traceId: lot.traceId,
      events: lot.events,
      eventCount: lot.events.length,
    });
  } catch (error) {
    console.error('GET /api/lots/[traceId]/events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}
