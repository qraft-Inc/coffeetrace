import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Lot from '../../../models/Lot';
import Farmer from '../../../models/Farmer';
import AuditTrail from '../../../models/AuditTrail';
import { authOptions } from '../../../lib/authOptions';
import { generateQRCode } from '../../../lib/generateQRCode';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lots
 * List all lots with filtering and pagination
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const cooperativeId = searchParams.get('cooperativeId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (farmerId) query.farmerId = farmerId;
    if (cooperativeId) query.cooperativeId = cooperativeId;
    if (status) query.status = status;

    // Execute query
    const [lots, total] = await Promise.all([
      Lot.find(query)
        .populate('farmerId', 'name location')
        .populate('cooperativeId', 'name')
        .sort({ harvestDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lot.countDocuments(query),
    ]);

    return NextResponse.json({
      lots,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/lots error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lots', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lots
 * Create a new coffee lot with initial trace event
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
    const { farmerId, harvestDate, variety, quantityKg } = body;
    if (!farmerId || !harvestDate || !variety || !quantityKg) {
      return NextResponse.json(
        { error: 'Missing required fields: farmerId, harvestDate, variety, quantityKg' },
        { status: 400 }
      );
    }

    // Verify farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = session.user.farmerProfile === farmerId;
    const isCoopAdmin = session.user.role === 'coopAdmin' && 
                       session.user.cooperativeId === farmer.cooperativeId?.toString();
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isCoopAdmin && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Create lot
    const lot = new Lot({
      ...body,
      cooperativeId: farmer.cooperativeId,
      events: [{
        step: 'harvested',
        timestamp: new Date(harvestDate),
        actor: session.user.id,
        gps: farmer.location,
        note: 'Initial harvest recorded',
      }],
    });

    await lot.save();

    // Generate QR code
    try {
      const qrCodeUrl = await generateQRCode(lot.traceId);
      lot.qrCodeUrl = qrCodeUrl;
      await lot.save();
    } catch (qrError) {
      console.error('QR generation error:', qrError);
      // Continue even if QR fails
    }

    // Log creation
    await AuditTrail.log({
      entityType: 'Lot',
      entityId: lot._id,
      action: 'created',
      actorId: session.user.id,
      description: `New lot created: ${lot.traceId}`,
      metadata: {
        variety,
        quantityKg,
      },
    });

    return NextResponse.json(
      { message: 'Lot created successfully', lot },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/lots error:', error);
    return NextResponse.json(
      { error: 'Failed to create lot', details: error.message },
      { status: 500 }
    );
  }
}
