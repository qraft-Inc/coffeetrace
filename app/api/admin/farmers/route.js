import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Farmer from '@/models/Farmer';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/farmers
 * Get all farmers with pagination and filters
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
    const verificationStatus = searchParams.get('verificationStatus');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { farmName: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } },
      ];
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    // Fetch farmers with user details
    const [farmers, total] = await Promise.all([
      Farmer.find(query)
        .populate('userId', 'name email phone isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Farmer.countDocuments(query),
    ]);

    // Get verification status counts
    const statusCounts = await Farmer.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      farmers,
      total,
      count: farmers.length,
      page,
      limit,
      pages: Math.ceil(total / limit),
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farmers' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/farmers
 * Update farmer profile
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { farmerId, updates } = body;

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer ID required' }, { status: 400 });
    }

    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Farmer updated successfully',
      farmer,
    });
  } catch (error) {
    console.error('Error updating farmer:', error);
    return NextResponse.json(
      { error: 'Failed to update farmer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/farmers
 * Delete farmer(s)
 */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer ID required' }, { status: 400 });
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    // Also update or delete associated user
    if (farmer.userId) {
      await User.findByIdAndUpdate(farmer.userId, { farmerProfile: null });
    }

    await Farmer.findByIdAndDelete(farmerId);

    return NextResponse.json({
      message: 'Farmer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    return NextResponse.json(
      { error: 'Failed to delete farmer', details: error.message },
      { status: 500 }
    );
  }
}
