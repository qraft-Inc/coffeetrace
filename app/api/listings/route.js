import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Listing from '../../../models/Listing';
import Lot from '../../../models/Lot';
import AuditTrail from '../../../models/AuditTrail';
import { authOptions } from '../../../lib/authOptions';

/**
 * GET /api/listings
 * Get user's own listings
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const query = { sellerId: session.user.id };
    if (status) query.status = status;

    const listings = await Listing.find(query)
      .populate('lotId')
      .populate('offers')
      .sort({ postedAt: -1 })
      .lean();

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new marketplace listing
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    // Validate required fields
    const { lotId, pricePerKg, availableQuantityKg } = body;
    if (!lotId || !pricePerKg || !availableQuantityKg) {
      return NextResponse.json(
        { error: 'Missing required fields: lotId, pricePerKg, availableQuantityKg' },
        { status: 400 }
      );
    }

    // Verify lot exists and belongs to user
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    // Check if lot is already listed
    const existingListing = await Listing.findOne({ 
      lotId, 
      status: { $in: ['open', 'under_offer'] } 
    });
    
    if (existingListing) {
      return NextResponse.json(
        { error: 'This lot is already listed' },
        { status: 409 }
      );
    }

    // Verify available quantity doesn't exceed lot quantity
    if (availableQuantityKg > lot.quantityKg) {
      return NextResponse.json(
        { error: 'Available quantity exceeds lot quantity' },
        { status: 400 }
      );
    }

    // Create listing
    const listing = new Listing({
      ...body,
      sellerId: session.user.id,
      status: 'open',
    });

    await listing.save();

    // Update lot status
    lot.status = 'listed';
    await lot.save();

    // Log listing creation
    await AuditTrail.log({
      entityType: 'Listing',
      entityId: listing._id,
      action: 'listing_created',
      actorId: session.user.id,
      description: `New listing created for lot ${lot.traceId}`,
      metadata: {
        pricePerKg,
        availableQuantityKg,
      },
    });

    return NextResponse.json(
      { message: 'Listing created successfully', listing },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/listings error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing', details: error.message },
      { status: 500 }
    );
  }
}
