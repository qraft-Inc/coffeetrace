import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../../lib/dbConnect';
import Listing from '../../../../../models/Listing';
import Offer from '../../../../../models/Offer';
import AuditTrail from '../../../../../models/AuditTrail';
import { authOptions } from '../../../../../lib/authOptions';

/**
 * POST /api/listings/[id]/offers
 * Create an offer on a listing
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only buyers can make offers
    if (session.user.role !== 'buyer') {
      return NextResponse.json(
        { error: 'Only buyers can make offers' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    const { amountKg, pricePerKg, message } = body;
    if (!amountKg || !pricePerKg) {
      return NextResponse.json(
        { error: 'Missing required fields: amountKg, pricePerKg' },
        { status: 400 }
      );
    }

    // Find listing
    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check listing is open
    if (listing.status !== 'open') {
      return NextResponse.json(
        { error: 'This listing is no longer accepting offers' },
        { status: 400 }
      );
    }

    // Check amount doesn't exceed available
    if (amountKg > listing.availableQuantityKg) {
      return NextResponse.json(
        { error: 'Offer amount exceeds available quantity' },
        { status: 400 }
      );
    }

    // Check minimum quantity
    if (amountKg < listing.minQuantityKg) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${listing.minQuantityKg} kg` },
        { status: 400 }
      );
    }

    // Create offer
    const offer = new Offer({
      listingId: id,
      buyerId: session.user.id,
      amountKg,
      pricePerKg,
      currency: listing.currency,
      message,
      status: 'pending',
    });

    await offer.save();

    // Add offer to listing
    listing.offers.push(offer._id);
    listing.status = 'under_offer';
    await listing.save();

    // Log offer creation
    await AuditTrail.log({
      entityType: 'Offer',
      entityId: offer._id,
      action: 'offer_made',
      actorId: session.user.id,
      description: `Offer made on listing ${listing._id}`,
      metadata: {
        amountKg,
        pricePerKg,
        totalAmount: offer.totalAmount,
      },
    });

    return NextResponse.json(
      { message: 'Offer created successfully', offer },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/listings/[id]/offers error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings/[id]/offers
 * Get all offers for a listing
 */
export async function GET(request, { params }) {
  try {
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

    // Only seller can view all offers
    if (listing.sellerId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const offers = await Offer.find({ listingId: id })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('GET /api/listings/[id]/offers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers', details: error.message },
      { status: 500 }
    );
  }
}
