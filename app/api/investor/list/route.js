import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import Investment from '../../../../models/Investment';

/**
 * GET /api/investor/list
 * Get list of all investors with their investment counts
 * Only accessible by investors (admin users)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'investor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const query = { role: 'investor' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const investors = await User.find(query)
      .select('name email isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get investment counts and totals for each investor
    const investorsWithStats = await Promise.all(
      investors.map(async (investor) => {
        const investments = await Investment.find({ investorUserId: investor._id }).lean();
        
        const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
        const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const activeInvestments = investments.filter(i => ['active', 'pending', 'approved'].includes(i.status)).length;

        return {
          ...investor,
          investmentCount: investments.length,
          activeInvestments,
          totalInvested,
          totalCurrentValue,
          totalGains: totalCurrentValue - totalInvested,
        };
      })
    );

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      investors: investorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch investors', error: error.message },
      { status: 500 }
    );
  }
}
