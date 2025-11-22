import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import PickupRequest from '@/models/PickupRequest';
import User from '@/models/User';

/**
 * GET /api/pickup-requests
 * Fetch pickup requests with filters
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const farmerId = searchParams.get('farmerId');
    const assignedTo = searchParams.get('assignedTo');
    const urgency = searchParams.get('urgency');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query based on role
    let query = {};

    if (session.user.role === 'farmer') {
      query.farmerId = session.user.id;
    } else if (session.user.role === 'agent' || session.user.role === 'coopAdmin') {
      if (assignedTo === 'me') {
        query['assignedTo.userId'] = session.user.id;
      }
    }

    // Apply filters
    if (status) query.status = status;
    if (farmerId && ['admin', 'coopAdmin'].includes(session.user.role)) {
      query.farmerId = farmerId;
    }
    if (urgency) query.urgency = urgency;

    const skip = (page - 1) * limit;

    const [pickupRequests, total] = await Promise.all([
      PickupRequest.find(query)
        .sort({ urgency: -1, requestedDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate('farmerId', 'fullName location phoneNumber')
        .populate('lotId', 'lotNumber weight coffeeType')
        .populate('assignedTo.userId', 'fullName email phoneNumber')
        .lean(),
      PickupRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      pickupRequests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pickup requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pickup requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pickup-requests
 * Create a new pickup request
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only farmers and admins can create pickup requests
    if (!['farmer', 'admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const {
      lotId,
      requestType,
      pickupLocation,
      deliveryLocation,
      estimatedWeight,
      coffeeType,
      qualityGrade,
      packagingType,
      numberOfPackages,
      requestedDate,
      preferredTimeSlot,
      specialInstructions,
      urgency,
    } = data;

    // Set farmerId based on role
    let farmerId;
    if (session.user.role === 'farmer') {
      farmerId = session.user.id;
    } else {
      farmerId = data.farmerId;
    }

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer ID required' }, { status: 400 });
    }

    // Create pickup request
    const pickupRequest = await PickupRequest.create({
      farmerId,
      lotId,
      requestType: requestType || 'collection',
      pickupLocation,
      deliveryLocation,
      estimatedWeight,
      coffeeType,
      qualityGrade,
      packagingType: packagingType || 'bags',
      numberOfPackages,
      requestedDate,
      preferredTimeSlot: preferredTimeSlot || 'flexible',
      specialInstructions,
      urgency: urgency || 'medium',
    });

    await pickupRequest.populate([
      { path: 'farmerId', select: 'fullName location phoneNumber' },
      { path: 'lotId', select: 'lotNumber weight coffeeType' },
    ]);

    return NextResponse.json({ pickupRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating pickup request:', error);
    return NextResponse.json(
      { error: 'Failed to create pickup request' },
      { status: 500 }
    );
  }
}
