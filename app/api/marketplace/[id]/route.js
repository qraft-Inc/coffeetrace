import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const listing = await Listing.findById(id)
      .populate({
        path: 'lotId',
        populate: [
          { path: 'farmerId' },
          { path: 'cooperativeId' }
        ]
      })
      .populate('sellerId', 'name email phone profile')
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('GET /api/marketplace/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', details: error.message },
      { status: 500 }
    );
  }
}
