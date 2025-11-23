import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Farmer from '../../../models/Farmer';
import User from '../../../models/User';
import AuditTrail from '../../../models/AuditTrail';
import { authOptions } from '../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/farmers
 * List all farmers with optional filtering
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Cache farmers list for 5 minutes
    const headers = {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    };
    const cooperativeId = searchParams.get('cooperativeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (cooperativeId) {
      query.cooperativeId = cooperativeId;
    }

    // Execute query with pagination
    const [farmers, total] = await Promise.all([
      Farmer.find(query)
        .populate('userId', 'name email phone')
        .populate('cooperativeId', 'name location')
        .select('-kycDocuments -nationalId -photoIdUrl') // Exclude sensitive data
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Farmer.countDocuments(query),
    ]);

    return NextResponse.json({
      farmers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { headers });
  } catch (error) {
    console.error('GET /api/farmers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farmers', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/farmers
 * Create a new farmer profile
 */
export async function POST(request) {
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

    const body = await request.json();
    await dbConnect();

    // Validate required fields
    const { name, userId, location, farmSize } = body;
    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    // Check if farmer profile already exists for this user
    const existingFarmer = await Farmer.findOne({ userId });
    if (existingFarmer) {
      return NextResponse.json(
        { error: 'Farmer profile already exists for this user' },
        { status: 409 }
      );
    }

    // Create farmer
    const farmer = new Farmer({
      ...body,
      location: location ? {
        type: 'Point',
        coordinates: location.coordinates || [],
      } : undefined,
    });

    await farmer.save();

    // Update user's farmerProfile reference
    await User.findByIdAndUpdate(userId, {
      farmerProfile: farmer._id,
    });

    // Log creation
    await AuditTrail.log({
      entityType: 'Farmer',
      entityId: farmer._id,
      action: 'created',
      actorId: session.user.id,
      description: `Farmer profile created for ${name}`,
    });

    return NextResponse.json(
      { message: 'Farmer created successfully', farmer },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/farmers error:', error);
    return NextResponse.json(
      { error: 'Failed to create farmer', details: error.message },
      { status: 500 }
    );
  }
}
