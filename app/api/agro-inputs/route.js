import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import AgroInput from '../../../models/AgroInput';
import Cooperative from '../../../models/Cooperative';
import { authOptions } from '../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agro-inputs
 * Get all agro-inputs with filtering and pagination
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const cooperativeId = searchParams.get('cooperativeId');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');

    const query = {};

    if (category) query.category = category;
    if (cooperativeId) query.cooperativeId = cooperativeId;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [agroInputs, total] = await Promise.all([
      AgroInput.find(query)
        .populate('cooperativeId', 'name location contactEmail')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AgroInput.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      items: agroInputs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('GET /api/agro-inputs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agro-inputs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agro-inputs
 * Create a new agro-input product (cooperative admin only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only coop admins and system admins can create agro-inputs
    if (!['coopAdmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // If coop admin, ensure they can only create for their cooperative
    if (session.user.role === 'coopAdmin') {
      if (!session.user.cooperativeId) {
        return NextResponse.json(
          { error: 'Cooperative not found for user' },
          { status: 400 }
        );
      }
      body.cooperativeId = session.user.cooperativeId;
    }

    body.createdBy = session.user.id;
    body.status = session.user.role === 'admin' ? 'active' : 'pending_approval';

    const agroInput = await AgroInput.create(body);

    const populatedInput = await AgroInput.findById(agroInput._id)
      .populate('cooperativeId', 'name location')
      .populate('createdBy', 'name');

    return NextResponse.json({
      success: true,
      message: 'Agro-input created successfully',
      item: populatedInput,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/agro-inputs error:', error);
    return NextResponse.json(
      { error: 'Failed to create agro-input', details: error.message },
      { status: 500 }
    );
  }
}
