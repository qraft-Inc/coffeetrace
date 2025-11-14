import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Farmer from '../../../../models/Farmer';
import Lot from '../../../../models/Lot';
import AuditTrail from '../../../../models/AuditTrail';
import { authOptions } from '../../../../lib/authOptions';

/**
 * GET /api/farmers/[id]
 * Get a specific farmer by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

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
    const totalYield = farmer.yields.reduce((sum, y) => sum + y.quantityKg, 0);
    const avgYield = farmer.yields.length > 0 
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;
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

    // Update farmer
    Object.assign(existingFarmer, body);
    
    // Handle location update
    if (body.location?.coordinates) {
      existingFarmer.location = {
        type: 'Point',
        coordinates: body.location.coordinates,
      };
    }

    await existingFarmer.save();

    // Log update
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin only' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;

    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Soft delete - just mark as inactive in the user record
    await User.findByIdAndUpdate(farmer.userId, { isActive: false });

    // Log deletion
    await AuditTrail.log({
      entityType: 'Farmer',
      entityId: farmer._id,
      action: 'deleted',
      actorId: session.user.id,
      description: `Farmer profile deactivated`,
    });

    return NextResponse.json({
      message: 'Farmer deactivated successfully',
    });
  } catch (error) {
    console.error('DELETE /api/farmers/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete farmer', details: error.message },
      { status: 500 }
    );
  }
}
