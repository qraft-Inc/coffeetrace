import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import { authOptions } from '../../../../lib/authOptions';
import Farm from '../../../../models/Farm';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const farm = await Farm.findById(id).lean();
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isCoopAdmin = session.user.role === 'coopAdmin';
    const sameCoop =
      Boolean(farm.cooperativeId && session.user.cooperativeId) &&
      farm.cooperativeId.toString() === session.user.cooperativeId;
    const ownFarm = farm.createdBy?.toString() === session.user.id;
    const ownedByFarmer = farm.ownerUserId?.toString() === session.user.id;

    if (!(isAdmin || (isCoopAdmin && sameCoop) || ownFarm || ownedByFarmer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ farm });
  } catch (error) {
    console.error('GET /api/farms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['coopAdmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { status, moderationNotes = '' } = await request.json();

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    await dbConnect();
    const farm = await Farm.findById(id);
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    if (session.user.role === 'coopAdmin') {
      const sameCoop =
        Boolean(farm.cooperativeId && session.user.cooperativeId) &&
        farm.cooperativeId.toString() === session.user.cooperativeId;

      if (!sameCoop) {
        return NextResponse.json({ error: 'Cannot moderate another cooperative\'s farm' }, { status: 403 });
      }
    }

    farm.status = status;
    farm.moderationNotes = typeof moderationNotes === 'string' ? moderationNotes.trim() : '';
    farm.moderatedBy = session.user.id;
    farm.moderatedAt = new Date();
    await farm.save();

    return NextResponse.json({ farm });
  } catch (error) {
    console.error('PATCH /api/farms/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update farm status', details: error.message },
      { status: 500 }
    );
  }
}
