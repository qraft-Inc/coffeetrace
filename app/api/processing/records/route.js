import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { WetMillProcessing, DryMillProcessing, DryingRecord } from '@/models/ProcessingRecord';
import AuditLog from '@/models/AuditLog';

/**
 * GET /api/processing/records
 * Fetch processing records
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
    const type = searchParams.get('type'); // wet_mill, dry_mill, drying
    const status = searchParams.get('status');

    if (!lotId) {
      return NextResponse.json({ error: 'Lot ID required' }, { status: 400 });
    }

    let records = {};

    if (!type || type === 'wet_mill') {
      const wetMill = await WetMillProcessing.find({ lotId, ...(status && { status }) })
        .populate('operator', 'name')
        .sort({ startDate: -1 })
        .lean();
      records.wetMill = wetMill;
    }

    if (!type || type === 'dry_mill') {
      const dryMill = await DryMillProcessing.find({ lotId, ...(status && { status }) })
        .populate('operator', 'name')
        .sort({ startDate: -1 })
        .lean();
      records.dryMill = dryMill;
    }

    if (!type || type === 'drying') {
      const drying = await DryingRecord.find({ lotId, ...(status && { status }) })
        .populate('operator', 'name')
        .sort({ startDate: -1 })
        .lean();
      records.drying = drying;
    }

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching processing records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processing records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/processing/records
 * Create processing record
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { type, data } = await req.json();

    if (!type || !data) {
      return NextResponse.json({ error: 'Type and data required' }, { status: 400 });
    }

    let record;
    let action;

    switch (type) {
      case 'wet_mill':
        record = await WetMillProcessing.create({
          ...data,
          operator: session.user.id,
        });
        action = 'wet_mill_started';
        break;

      case 'dry_mill':
        record = await DryMillProcessing.create({
          ...data,
          operator: session.user.id,
        });
        action = 'dry_mill_started';
        break;

      case 'drying':
        record = await DryingRecord.create({
          ...data,
          operator: session.user.id,
        });
        action = 'drying_started';
        break;

      default:
        return NextResponse.json({ error: 'Invalid processing type' }, { status: 400 });
    }

    // Create audit log
    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action,
      actionCategory: 'processing',
      resourceType: type === 'wet_mill' ? 'WetMillProcessing' : type === 'dry_mill' ? 'DryMillProcessing' : 'DryingRecord',
      resourceId: record._id,
      resourceIdentifier: record.batchNumber || data.lotId,
      description: `${type.replace('_', ' ')} processing record created`,
      result: 'success',
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating processing record:', error);
    return NextResponse.json(
      { error: 'Failed to create processing record' },
      { status: 500 }
    );
  }
}
