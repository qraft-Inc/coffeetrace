import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { ExportBatch } from '@/models/Inventory';
import Lot from '@/models/Lot';
import AuditLog from '@/models/AuditLog';

/**
 * GET /api/export/batches
 * Fetch export batches
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
    const buyerId = searchParams.get('buyerId');

    let query = {};
    
    if (session.user.role === 'buyer') {
      query.buyerId = session.user.id;
    } else if (buyerId) {
      query.buyerId = buyerId;
    }

    if (status) query.status = status;

    const batches = await ExportBatch.find(query)
      .populate('exporterId', 'name companyName')
      .populate('buyerId', 'name companyName')
      .populate('lots.lotId', 'traceId variety')
      .populate('lots.farmerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error fetching export batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch export batches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/export/batches
 * Create export batch
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const { batchNumber, exporterId, buyerId, lots, container, shipping, documents } = data;

    if (!batchNumber || !exporterId || !buyerId || !lots || lots.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalWeightKg = lots.reduce((sum, lot) => sum + (lot.weightKg || 0), 0);
    const totalBags = lots.reduce((sum, lot) => sum + (lot.bags || 0), 0);

    const batch = await ExportBatch.create({
      batchNumber,
      exporterId,
      buyerId,
      lots,
      totalWeightKg,
      totalBags,
      container,
      shipping,
      documents,
      createdBy: session.user.id,
      statusHistory: [{
        status: 'preparation',
        timestamp: new Date(),
        updatedBy: session.user.id,
      }],
    });

    // Update lot statuses
    await Lot.updateMany(
      { _id: { $in: lots.map(l => l.lotId) } },
      { $set: { status: 'exported' } }
    );

    // Create audit log
    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'export_batch_created',
      actionCategory: 'export',
      resourceType: 'ExportBatch',
      resourceId: batch._id,
      resourceIdentifier: batchNumber,
      description: `Export batch ${batchNumber} created with ${lots.length} lots (${totalWeightKg}kg)`,
      compliance: {
        eudrRelevant: true,
      },
      result: 'success',
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error('Error creating export batch:', error);
    return NextResponse.json(
      { error: 'Failed to create export batch' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/export/batches
 * Update export batch status
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { batchId, status, notes, shipping } = await req.json();

    if (!batchId || !status) {
      return NextResponse.json({ error: 'Batch ID and status required' }, { status: 400 });
    }

    const batch = await ExportBatch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    batch.status = status;
    batch.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: session.user.id,
      notes,
    });

    if (shipping) {
      batch.shipping = { ...batch.shipping, ...shipping };
    }

    await batch.save();

    // Create audit log
    let action = 'export_batch_updated';
    if (status === 'container_loaded') action = 'container_loaded';
    else if (status === 'in_transit') action = 'shipment_departed';
    else if (status === 'arrived') action = 'shipment_arrived';

    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action,
      actionCategory: 'export',
      resourceType: 'ExportBatch',
      resourceId: batch._id,
      resourceIdentifier: batch.batchNumber,
      description: `Export batch ${batch.batchNumber} status updated to ${status}`,
      result: 'success',
    });

    return NextResponse.json({ batch });
  } catch (error) {
    console.error('Error updating export batch:', error);
    return NextResponse.json(
      { error: 'Failed to update export batch' },
      { status: 500 }
    );
  }
}
