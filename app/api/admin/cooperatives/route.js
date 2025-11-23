import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Cooperative from '@/models/Cooperative';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cooperatives
 * Get all cooperatives with pagination
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch cooperatives
    const [cooperatives, total] = await Promise.all([
      Cooperative.find(query)
        .populate('adminId', 'name email phone')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cooperative.countDocuments(query),
    ]);

    return NextResponse.json({
      cooperatives,
      total,
      count: cooperatives.length,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching cooperatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cooperatives' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cooperatives
 * Create a new cooperative
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const cooperative = await Cooperative.create(body);

    return NextResponse.json(
      { message: 'Cooperative created successfully', cooperative },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cooperative:', error);
    return NextResponse.json(
      { error: 'Failed to create cooperative', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/cooperatives
 * Update cooperative
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { cooperativeId, updates } = body;

    if (!cooperativeId) {
      return NextResponse.json({ error: 'Cooperative ID required' }, { status: 400 });
    }

    const cooperative = await Cooperative.findByIdAndUpdate(
      cooperativeId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('adminId', 'name email');

    if (!cooperative) {
      return NextResponse.json({ error: 'Cooperative not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Cooperative updated successfully',
      cooperative,
    });
  } catch (error) {
    console.error('Error updating cooperative:', error);
    return NextResponse.json(
      { error: 'Failed to update cooperative', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cooperatives
 * Delete cooperative
 */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const cooperativeId = searchParams.get('cooperativeId');

    if (!cooperativeId) {
      return NextResponse.json({ error: 'Cooperative ID required' }, { status: 400 });
    }

    await Cooperative.findByIdAndDelete(cooperativeId);

    return NextResponse.json({
      message: 'Cooperative deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cooperative:', error);
    return NextResponse.json(
      { error: 'Failed to delete cooperative', details: error.message },
      { status: 500 }
    );
  }
}
