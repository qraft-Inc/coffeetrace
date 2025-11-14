import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Listing from '../../../../models/Listing';
import Offer from '../../../../models/Offer';
import AuditTrail from '../../../../models/AuditTrail';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/listings/[id]
 * Get a specific listing by ID
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
    const { id } = params;

    const listing = await Listing.findById(id)
      .populate({
        path: 'lotId',
        populate: {
          path: 'farmerId',
          select: 'name location certifications farmSize altitude',
        },
      })
      .populate('sellerId', 'name email phone')
      .populate({
        path: 'offers',
        populate: {
          path: 'buyerId',
          select: 'name email',
        },
      })
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Listing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('GET /api/listings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/listings/[id]
 * Update a listing (price, status, etc.)
 */
export async function PUT(request, { params }) {
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
    const { id } = params;
    const body = await request.json();

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Authorization - only seller can update
    if (listing.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - not your listing' },
        { status: 403 }
      );
    }

    // Update listing
    const oldValues = listing.toObject();
    Object.assign(listing, body);
    await listing.save();

    // Log update
    await AuditTrail.log({
      entityType: 'Listing',
      entityId: listing._id,
      action: 'updated',
      actorId: session.user.id,
      changes: {
        before: oldValues,
        after: listing.toObject(),
      },
    });

    return NextResponse.json({
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    console.error('PUT /api/listings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]
 * Cancel a listing
 */
export async function DELETE(request, { params }) {
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
    const { id } = params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Authorization
    if (listing.sellerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update status to cancelled
    listing.status = 'cancelled';
    await listing.save();

    // Log cancellation
    await AuditTrail.log({
      entityType: 'Listing',
      entityId: listing._id,
      action: 'listing_cancelled',
      actorId: session.user.id,
    });

    return NextResponse.json({
      message: 'Listing cancelled successfully',
    });
  } catch (error) {
    console.error('DELETE /api/listings/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel listing', details: error.message },
      { status: 500 }
    );
  }
}
