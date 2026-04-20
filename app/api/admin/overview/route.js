import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Cooperative from '@/models/Cooperative';
import Farmer from '@/models/Farmer';
import Payout from '@/models/Payout';
import Loan from '@/models/Loan';
import Listing from '@/models/Listing';
import Order from '@/models/Order';
import Wallet from '@/models/Wallet';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/overview
 * Extended overview stats for the super admin dashboard
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      // Cooperatives
      totalCoops,
      activeCoops,

      // Pending payouts
      pendingPayouts,
      pendingPayoutTotal,

      // Loans
      pendingLoans,
      pendingLoanTotal,
      activeLoans,
      activeLoanTotal,

      // Marketplace
      activeListings,
      recentOrders,

      // Wallet totals
      walletTotals,

      // New registrations
      newUsersThisWeek,
      newUsersThisMonth,

      // Role breakdown
      roleBreakdown,

      // Inactive users
      inactiveUsers,
    ] = await Promise.all([
      // Cooperatives
      Cooperative.countDocuments(),
      Cooperative.countDocuments({ isActive: true }),

      // Pending payouts count
      Payout.countDocuments({ status: 'pending' }),
      // Pending payout total amount
      Payout.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Pending loan applications
      Loan.countDocuments({ status: 'pending' }),
      Loan.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$principalAmount' } } },
      ]),
      // Active (disbursed/repaying) loans
      Loan.countDocuments({ status: { $in: ['disbursed', 'repaying'] } }),
      Loan.aggregate([
        { $match: { status: { $in: ['disbursed', 'repaying'] } } },
        { $group: { _id: null, total: { $sum: '$amountOutstanding' } } },
      ]),

      // Active marketplace listings
      Listing.countDocuments({ status: 'open' }),
      // Recent orders (last 30 days)
      Order.countDocuments({ createdAt: { $gte: monthAgo } }),

      // Total wallet balances across all users
      Wallet.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: '$balance' },
            totalAvailable: { $sum: '$availableBalance' },
            totalLocked: { $sum: '$lockedBalance' },
            walletCount: { $sum: 1 },
          },
        },
      ]),

      // New registrations
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: monthAgo } }),

      // Role distribution
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Inactive users (not logged in for 30+ days and account exists)
      User.countDocuments({
        isActive: true,
        $or: [
          { lastLogin: { $lt: monthAgo } },
          { lastLogin: null },
        ],
        createdAt: { $lt: monthAgo }, // exclude brand-new accounts
      }),
    ]);

    // Get cooperative member counts
    const coopMemberStats = await Farmer.aggregate([
      {
        $group: {
          _id: '$cooperativeId',
          farmerCount: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { farmerCount: -1 } },
      { $limit: 5 },
    ]);

    // Populate coop names
    const topCoops = await Promise.all(
      coopMemberStats.map(async (stat) => {
        const coop = await Cooperative.findById(stat._id).select('name isActive').lean();
        return {
          name: coop?.name || 'Unknown',
          isActive: coop?.isActive ?? false,
          farmerCount: stat.farmerCount,
        };
      })
    );

    // Recent registrations with role
    const recentRegistrations = await User.find({ createdAt: { $gte: weekAgo } })
      .select('name email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      overview: {
        cooperatives: {
          total: totalCoops,
          active: activeCoops,
          inactive: totalCoops - activeCoops,
          topByMembers: topCoops,
        },
        payouts: {
          pendingCount: pendingPayouts,
          pendingTotal: pendingPayoutTotal[0]?.total || 0,
        },
        loans: {
          pendingCount: pendingLoans,
          pendingTotal: pendingLoanTotal[0]?.total || 0,
          activeCount: activeLoans,
          activeOutstanding: activeLoanTotal[0]?.total || 0,
        },
        marketplace: {
          activeListings,
          recentOrders,
        },
        wallets: {
          totalBalance: walletTotals[0]?.totalBalance || 0,
          totalAvailable: walletTotals[0]?.totalAvailable || 0,
          totalLocked: walletTotals[0]?.totalLocked || 0,
          walletCount: walletTotals[0]?.walletCount || 0,
        },
        registrations: {
          thisWeek: newUsersThisWeek,
          thisMonth: newUsersThisMonth,
          recent: recentRegistrations,
        },
        roleBreakdown: roleBreakdown.map((r) => ({ role: r._id, count: r.count })),
        inactiveUsers,
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
