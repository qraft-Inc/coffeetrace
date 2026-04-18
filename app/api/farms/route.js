import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import { authOptions } from '../../../lib/authOptions';
import Farm from '../../../models/Farm';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cropType = searchParams.get('cropType');
    const cooperativeId = searchParams.get('cooperativeId');

    const query = {};
    if (status) query.status = status;
    if (cropType) query.cropType = cropType;

    if (session.user.role === 'admin') {
      if (cooperativeId) query.cooperativeId = cooperativeId;
    } else if (session.user.role === 'coopAdmin') {
      if (!session.user.cooperativeId) {
        return NextResponse.json({ error: 'Cooperative not linked to account' }, { status: 400 });
      }
      query.cooperativeId = session.user.cooperativeId;
    } else {
      query.$or = [
        { createdBy: session.user.id },
        { ownerUserId: session.user.id },
      ];
    }

    const farms = await Farm.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ farms });
  } catch (error) {
    console.error('GET /api/farms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['coopAdmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await request.json();

    if (!payload?.farmerName || !payload?.farmName || !payload?.cropType || !payload?.polygon?.geometry?.coordinates) {
      return NextResponse.json(
        { error: 'farmerName, farmName, cropType and polygon are required' },
        { status: 400 }
      );
    }

    const coordinates = payload.polygon.geometry.coordinates?.[0] || [];
    if (coordinates.length < 4) {
      return NextResponse.json(
        { error: 'Polygon must have at least 3 points and be closed' },
        { status: 400 }
      );
    }

    if (session.user.role === 'coopAdmin' && !payload.ownerUserId) {
      return NextResponse.json(
        { error: 'ownerUserId is required for cooperative farm mapping' },
        { status: 400 }
      );
    }

    await dbConnect();

    const targetCooperativeId =
      session.user.role === 'admin'
        ? (payload.cooperativeId || session.user.cooperativeId)
        : session.user.cooperativeId;

    if (!targetCooperativeId) {
      return NextResponse.json(
        { error: 'Cooperative ID is required for farm records' },
        { status: 400 }
      );
    }

    if (payload.ownerUserId) {
      const ownerUser = await User.findById(payload.ownerUserId).select('role cooperativeId').lean();
      if (!ownerUser) {
        return NextResponse.json({ error: 'Assigned owner user not found' }, { status: 404 });
      }

      if (ownerUser.role !== 'farmer') {
        return NextResponse.json({ error: 'Assigned owner must be a farmer account' }, { status: 400 });
      }

      if (
        session.user.role === 'coopAdmin' &&
        ownerUser.cooperativeId?.toString() !== targetCooperativeId.toString()
      ) {
        return NextResponse.json(
          { error: 'Assigned farmer must belong to your cooperative' },
          { status: 403 }
        );
      }
    }

    const farm = await Farm.create({
      farmerName: payload.farmerName,
      phone: payload.phone || '',
      farmName: payload.farmName,
      cropType: payload.cropType,
      notes: payload.notes || '',
      area: Number(payload.area) || 0,
      polygon: payload.polygon,
      images: Array.isArray(payload.images) ? payload.images : [],
      status: session.user.role === 'admin' ? (payload.status || 'pending') : 'pending',
      createdBy: session.user.id,
      ownerUserId: payload.ownerUserId || undefined,
      cooperativeId: targetCooperativeId,
    });

    return NextResponse.json({ farm }, { status: 201 });
  } catch (error) {
    console.error('POST /api/farms error:', error);
    return NextResponse.json(
      { error: 'Failed to save farm', details: error.message },
      { status: 500 }
    );
  }
}
