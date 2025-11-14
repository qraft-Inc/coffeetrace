import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Offer from '../../../../models/Offer';
import Listing from '../../../../models/Listing';
import Lot from '../../../../models/Lot';
import Transaction from '../../../../models/Transaction';
import AuditTrail from '../../../../models/AuditTrail';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/offers/[id]
 * Get a specific offer
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

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;

    const offer = await Offer.findById(id)
      .populate('listingId')
      .populate('buyerId', 'name email')
      .lean();

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('GET /api/offers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/offers/[id]
 * Accept or reject an offer
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

    const { action, sellerResponse, counterOffer } = body;

    if (!['accept', 'reject', 'counter'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use: accept, reject, or counter' },
        { status: 400 }
      );
    }

    const offer = await Offer.findById(id).populate('listingId');
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    const listing = offer.listingId;
    
    // Authorization - only seller can respond
    if (listing.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - not your listing' },
        { status: 403 }
      );
    }

    if (action === 'accept') {
      // Accept offer
      offer.status = 'accepted';
      offer.sellerResponse = {
        message: sellerResponse || 'Offer accepted',
        respondedAt: new Date(),
      };
      await offer.save();

      // Update listing status
      listing.status = 'sold';
      listing.availableQuantityKg -= offer.amountKg;
      await listing.save();

      // Update lot status
      const lot = await Lot.findById(listing.lotId);
      if (lot) {
        lot.status = 'sold';
        await lot.save();
      }

      // Create transaction record
      const transaction = new Transaction({
        offerId: offer._id,
        listingId: listing._id,
        lotId: listing.lotId,
        buyerId: offer.buyerId,
        sellerId: listing.sellerId,
        amountKg: offer.amountKg,
        pricePerKg: offer.pricePerKg,
        totalAmount: offer.totalAmount,
        currency: offer.currency,
        paymentStatus: 'pending',
      });
      await transaction.save();

      // Log acceptance
      await AuditTrail.log({
        entityType: 'Offer',
        entityId: offer._id,
        action: 'offer_accepted',
        actorId: session.user.id,
        description: `Offer accepted - transaction created`,
        metadata: {
          transactionId: transaction._id,
          totalAmount: offer.totalAmount,
        },
      });

      return NextResponse.json({
        message: 'Offer accepted successfully',
        offer,
        transaction,
      });

    } else if (action === 'reject') {
      // Reject offer
      offer.status = 'rejected';
      offer.sellerResponse = {
        message: sellerResponse || 'Offer rejected',
        respondedAt: new Date(),
      };
      await offer.save();

      // Log rejection
      await AuditTrail.log({
        entityType: 'Offer',
        entityId: offer._id,
        action: 'offer_rejected',
        actorId: session.user.id,
      });

      return NextResponse.json({
        message: 'Offer rejected',
        offer,
      });

    } else if (action === 'counter') {
      // Counter offer
      if (!counterOffer || !counterOffer.pricePerKg) {
        return NextResponse.json(
          { error: 'Counter offer details required' },
          { status: 400 }
        );
      }

      offer.status = 'countered';
      offer.counterOffer = {
        pricePerKg: counterOffer.pricePerKg,
        amountKg: counterOffer.amountKg || offer.amountKg,
        message: counterOffer.message,
      };
      offer.sellerResponse = {
        message: sellerResponse || 'Counter offer made',
        respondedAt: new Date(),
      };
      await offer.save();

      // Log counter
      await AuditTrail.log({
        entityType: 'Offer',
        entityId: offer._id,
        action: 'offer_countered',
        actorId: session.user.id,
        metadata: counterOffer,
      });

      return NextResponse.json({
        message: 'Counter offer sent',
        offer,
      });
    }
  } catch (error) {
    console.error('PUT /api/offers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update offer', details: error.message },
      { status: 500 }
    );
  }
}
