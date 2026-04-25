import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../../lib/dbConnect';
import Farmer from '../../../../../models/Farmer';
import User from '../../../../../models/User';
import { authOptions } from '../../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/farmers/[id]/assign-cooperative
 * Assigns a cooperative to an unlinked farmer.
 * Auth: coopAdmin (assigns their own coop) or admin (can specify any cooperativeId).
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['coopAdmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // coopAdmin always uses their own cooperativeId; admin may pass one explicitly
    const cooperativeId =
      session.user.role === 'coopAdmin'
        ? session.user.cooperativeId
        : body.cooperativeId || session.user.cooperativeId;

    if (!cooperativeId) {
      return NextResponse.json(
        { error: 'No cooperativeId available for this session' },
        { status: 400 }
      );
    }

    const farmer = await Farmer.findById(id);
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    // Prevent re-assigning a farmer who is already in a different cooperative
    if (
      farmer.cooperativeId &&
      farmer.cooperativeId.toString() !== cooperativeId.toString()
    ) {
      return NextResponse.json(
        { error: 'Farmer is already assigned to a different cooperative' },
        { status: 409 }
      );
    }

    farmer.cooperativeId = cooperativeId;
    await farmer.save();

    // Mirror cooperativeId on the User record too (used by session / auth checks)
    if (farmer.userId) {
      await User.findByIdAndUpdate(farmer.userId, { cooperativeId });
    }

    const updated = await Farmer.findById(id)
      .populate('userId', 'name email phone')
      .populate('cooperativeId', 'name')
      .lean();

    return NextResponse.json({ success: true, farmer: updated });
  } catch (error) {
    console.error('PATCH /api/farmers/[id]/assign-cooperative error:', error);
    return NextResponse.json(
      { error: 'Failed to assign cooperative', details: error.message },
      { status: 500 }
    );
  }
}
