import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Farmer from '../../../../models/Farmer';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/farmers/unlinked
 * Returns farmer accounts that have no cooperativeId assigned.
 * Supports optional ?search= query for name or email filtering.
 * Auth: coopAdmin or admin only.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['coopAdmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    // Find farmers with no cooperativeId
    const unlinked = await Farmer.find({
      $or: [{ cooperativeId: null }, { cooperativeId: { $exists: false } }],
    })
      .populate('userId', 'name email phone isActive')
      .select('name email phone farmSize farmSizeUnit address location userId createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Filter by search term (name or email) in JS so we can match across embedded + populated fields
    const filtered = search
      ? unlinked.filter((f) => {
          const name = (f.name || f.userId?.name || '').toLowerCase();
          const email = (f.email || f.userId?.email || '').toLowerCase();
          const phone = (f.phone || f.userId?.phone || '').toLowerCase();
          const q = search.toLowerCase();
          return name.includes(q) || email.includes(q) || phone.includes(q);
        })
      : unlinked;

    return NextResponse.json({ farmers: filtered });
  } catch (error) {
    console.error('GET /api/farmers/unlinked error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unlinked farmers', details: error.message },
      { status: 500 }
    );
  }
}
