import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import dbConnect from '../../../lib/dbConnect';
import Cooperative from '../../../models/Cooperative';
import Farmer from '../../../models/Farmer';

/**
 * GET /api/cooperatives
 * Get list of cooperatives with optional filters and pagination
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || '';
    const includeFarmers = searchParams.get('includeFarmers') === 'true';

    const query = {};

    // Search by name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by region
    if (region) {
      query['address.region'] = region;
    }

    const skip = (page - 1) * limit;

    const cooperatives = await Cooperative.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate('adminUserId', 'name email')
      .lean();

    // Get farmer counts for each cooperative
    const cooperativeIds = cooperatives.map((coop) => coop._id);
    const farmerCounts = await Farmer.aggregate([
      { $match: { cooperativeId: { $in: cooperativeIds } } },
      { $group: { _id: '$cooperativeId', count: { $sum: 1 } } },
    ]);

    const farmerCountMap = {};
    farmerCounts.forEach((item) => {
      farmerCountMap[item._id.toString()] = item.count;
    });

    // If includeFarmers is true, fetch farmers for each cooperative
    let cooperativesWithFarmers = cooperatives;
    if (includeFarmers) {
      cooperativesWithFarmers = await Promise.all(
        cooperatives.map(async (coop) => {
          const farmers = await Farmer.find({ cooperativeId: coop._id })
            .select('farmerName email phone farmSize location profileImage')
            .lean();
          return {
            ...coop,
            farmers,
            farmerCount: farmers.length,
          };
        })
      );
    } else {
      cooperativesWithFarmers = cooperatives.map((coop) => ({
        ...coop,
        farmerCount: farmerCountMap[coop._id.toString()] || 0,
      }));
    }

    const totalCooperatives = await Cooperative.countDocuments(query);
    const totalPages = Math.ceil(totalCooperatives / limit);

    return NextResponse.json({
      success: true,
      cooperatives: cooperativesWithFarmers,
      pagination: {
        page,
        limit,
        totalCooperatives,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching cooperatives:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cooperatives', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cooperatives
 * Create a new cooperative (admin only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await request.json();
    const cooperative = await Cooperative.create(data);

    return NextResponse.json(
      { success: true, cooperative },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cooperative:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create cooperative', error: error.message },
      { status: 500 }
    );
  }
}
