import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Listing from '../../../models/Listing';
import Lot from '../../../models/Lot';
import Farmer from '../../../models/Farmer';
import User from '../../../models/User';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/marketplace
 * Public endpoint to browse all available coffee listings
 */
export async function GET(request) {
  try {
    // Safety guard for build time
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Filters
    const variety = searchParams.get('variety');
    const minQuality = parseFloat(searchParams.get('minQuality') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const certification = searchParams.get('certification');
    const country = searchParams.get('country');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'postedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query for listings
    const query = { status: 'open' };
    if (maxPrice < 999999) {
      query.pricePerKg = { $lte: maxPrice };
    }

    // Execute query with lot population for filtering
    let listings = await Listing.find(query)
      .populate({
        path: 'lotId',
        populate: {
          path: 'farmerId',
          select: 'name location certifications',
        },
      })
      .populate('sellerId', 'name')
      .sort({ [sortBy]: sortOrder })
      .lean();

    // Apply lot-based filters
    if (variety || minQuality || certification || country) {
      listings = listings.filter(listing => {
        const lot = listing.lotId;
        if (!lot) return false;

        if (variety && lot.variety !== variety) return false;
        if (minQuality && (lot.qualityScore || 0) < minQuality) return false;
        
        if (certification) {
          const hasCert = lot.farmerId?.certifications?.some(
            cert => cert.name.toLowerCase().includes(certification.toLowerCase())
          );
          if (!hasCert) return false;
        }

        // Country filter would need address data
        if (country) {
          // TODO: Add country filtering when address is available
        }

        return true;
      });
    }

    // Paginate after filtering
    const total = listings.length;
    listings = listings.slice(skip, skip + limit);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        variety,
        minQuality,
        maxPrice,
        certification,
      },
    });
  } catch (error) {
    console.error('GET /api/marketplace error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace listings', details: error.message },
      { status: 500 }
    );
  }
}
