import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { InventoryMovement, Warehouse } from '@/models/Inventory';
import Lot from '@/models/Lot';
import AuditLog from '@/models/AuditLog';

/**
 * GET /api/inventory/movements
 * Fetch inventory movements
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');
    const movementType = searchParams.get('type');
    const warehouseId = searchParams.get('warehouseId');

    let query = {};
    if (lotId) query.lotId = lotId;
    if (movementType) query.movementType = movementType;
    if (warehouseId) {
      query.$or = [
        { 'fromLocation.warehouseId': warehouseId },
        { 'toLocation.warehouseId': warehouseId },
      ];
    }

    const movements = await InventoryMovement.find(query)
      .populate('lotId', 'traceId variety')
      .populate('movedBy', 'name')
      .sort({ movementDate: -1 })
      .lean();

    return NextResponse.json({ movements });
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory movements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/movements
 * Create inventory movement
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await req.json();
    const { movementType, lotId, weightKg, fromLocation, toLocation } = data;

    if (!movementType || !lotId || !weightKg) {
      return NextResponse.json(
        { error: 'Movement type, lot ID, and weight required' },
        { status: 400 }
      );
    }

    // Verify lot exists
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    const movement = await InventoryMovement.create({
      ...data,
      movedBy: session.user.id,
      movementDate: new Date(),
    });

    // Update warehouse stock
    if (toLocation?.warehouseId) {
      await Warehouse.findByIdAndUpdate(toLocation.warehouseId, {
        $inc: {
          'currentStock.totalKg': weightKg,
          'currentStock.totalBags': data.numberOfBags || 0,
          'currentStock.lotCount': 1,
        },
      });
    }

    if (fromLocation?.warehouseId) {
      await Warehouse.findByIdAndUpdate(fromLocation.warehouseId, {
        $inc: {
          'currentStock.totalKg': -weightKg,
          'currentStock.totalBags': -(data.numberOfBags || 0),
          'currentStock.lotCount': -1,
        },
      });
    }

    // Create audit log
    let action = 'inventory_stock_in';
    if (movementType === 'stock_out') action = 'inventory_stock_out';
    else if (movementType === 'transfer') action = 'warehouse_transfer';
    else if (movementType === 'merge') action = 'lot_merged';
    else if (movementType === 'split') action = 'lot_split';

    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action,
      actionCategory: 'inventory',
      resourceType: 'InventoryMovement',
      resourceId: movement._id,
      resourceIdentifier: lot.traceId,
      description: `Inventory movement: ${movementType} - ${weightKg}kg`,
      result: 'success',
    });

    return NextResponse.json({ movement }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    );
  }
}
