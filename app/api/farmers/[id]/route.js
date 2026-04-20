import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Farmer from '../../../../models/Farmer';
import Lot from '../../../../models/Lot';
import User from '../../../../models/User';
import AuditTrail from '../../../../models/AuditTrail';
import Cooperative from '../../../../models/Cooperative';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/farmers/[id]
 * Get a specific farmer by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const farmer = await Farmer.findById(id)
      .populate('userId', 'name email phone')
      .populate('cooperativeId', 'name location')
      .lean();

    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Get farmer's lots
    const lots = await Lot.find({ farmerId: id })
      .select('traceId harvestDate variety quantityKg status qualityScore')
      .sort({ harvestDate: -1 })
      .limit(10)
      .lean();

    // Calculate statistics
    const totalYield = farmer.yields?.reduce((sum, y) => sum + y.quantityKg, 0) || 0;
    const avgYield = farmer.yields?.length > 0 
      ? totalYield / farmer.yields.length 
      : 0;

    return NextResponse.json({
      farmer,
      lots,
      stats: {
        totalYield,
        avgYield,
        totalLots: lots.length,
      },
    });
  } catch (error) {
    console.error('GET /api/farmers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farmer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/farmers/[id]
 * Update a farmer profile
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
    const { id } = await params;
    const body = await request.json();

    // Find existing farmer
    const existingFarmer = await Farmer.findById(id);
    if (!existingFarmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Authorization check - only allow farmer themselves, coop admin, or system admin
    const isOwner = session.user.farmerProfile === id;
    const isCoopAdmin = session.user.role === 'coopAdmin' && 
                       session.user.cooperativeId === existingFarmer.cooperativeId?.toString();
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isCoopAdmin && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Store old values for audit
    const oldValues = existingFarmer.toObject();

    // Normalize legacy address payload into location for compatibility.
    const normalizedBody = { ...body };
    if (!normalizedBody.location && normalizedBody.address) {
      normalizedBody.location = {
        district: normalizedBody.address.district,
        region: normalizedBody.address.region,
        country: normalizedBody.address.country,
      };
    }

    const hasValidGeoPoint = (value) => {
      if (!value || typeof value !== 'object') return false;
      if (value.type !== 'Point') return false;
      if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) return false;
      return Number.isFinite(value.coordinates[0]) && Number.isFinite(value.coordinates[1]);
    };

    const locationText = {
      district: normalizedBody.location?.district,
      region: normalizedBody.location?.region,
      country: normalizedBody.location?.country,
    };

    normalizedBody.address = {
      ...(existingFarmer.address?.toObject ? existingFarmer.address.toObject() : existingFarmer.address || {}),
      ...(normalizedBody.address || {}),
      ...Object.fromEntries(Object.entries(locationText).filter(([, value]) => value !== undefined)),
    };

    // Update scalar fields first.
    Object.assign(existingFarmer, normalizedBody);

    // Keep location only when it is valid GeoJSON for the 2dsphere index.
    if (normalizedBody.location && hasValidGeoPoint(normalizedBody.location)) {
      const currentLocation = existingFarmer.location?.toObject
        ? existingFarmer.location.toObject()
        : (existingFarmer.location || {});

      existingFarmer.location = {
        ...currentLocation,
        ...normalizedBody.location,
      };

      existingFarmer.location.type = 'Point';
      existingFarmer.markModified('location');
    } else {
      existingFarmer.set('location', undefined);
      existingFarmer.markModified('location');
    }

    await existingFarmer.save();

    // Log update (non-blocking)
    try {
      await AuditTrail.log({
        entityType: 'Farmer',
        entityId: existingFarmer._id,
        action: 'updated',
        actorId: session.user.id,
        changes: {
          before: oldValues,
          after: existingFarmer.toObject(),
        },
        description: `Farmer profile updated`,
      });
    } catch (auditErr) {
      console.error('Audit log failed (non-blocking):', auditErr);
    }

    return NextResponse.json({
      message: 'Farmer updated successfully',
      farmer: existingFarmer,
    });
  } catch (error) {
    console.error('PUT /api/farmers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update farmer', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/farmers/[id]
 * Delete a farmer profile (soft delete by setting inactive)
 */
export async function DELETE(request, { params }) {
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
    const { id } = await params;

    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'admin';
    const isCoopAdmin = session.user.role === 'coopAdmin' &&
      session.user.cooperativeId === farmer.cooperativeId?.toString();

    if (!isAdmin && !isCoopAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Best-effort user deactivation for login safety; do not block farmer deletion if this fails.
    if (farmer.userId) {
      try {
        await User.findByIdAndUpdate(farmer.userId, {
          isActive: false,
          farmerProfile: null,
        });
      } catch (userUpdateErr) {
        console.error('User deactivation failed (non-blocking):', userUpdateErr);
      }
    }

    // Remove the farmer profile record so it no longer appears in management lists.
    await Farmer.findByIdAndDelete(id);

    // Log deletion (non-blocking)
    try {
      await AuditTrail.log({
        entityType: 'Farmer',
        entityId: farmer._id,
        action: 'deleted',
        actorId: session.user.id,
        description: `Farmer profile deleted`,
      });
    } catch (logErr) {
      console.error('Audit log failed (non-blocking):', logErr);
    }

    return NextResponse.json({
      message: 'Farmer deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/farmers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete farmer', details: error.message },
      { status: 500 }
    );
  }
}
