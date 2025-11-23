import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../../lib/dbConnect';
import PaymentTransaction from '../../../../../models/PaymentTransaction';
import Tip from '../../../../../models/Tip';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/farmers/[id]/earnings
 * Get farmer's total earnings from sales and tips
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify farmer can only access their own data or admin
    if (session.user.role !== 'admin' && session.user.farmerProfile?.toString() !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get earnings from sales (PaymentTransactions)
    const salesEarnings = await PaymentTransaction.aggregate([
      {
        $match: {
          farmerId: new mongoose.Types.ObjectId(id),
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$totalAmount' },
          totalNet: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 },
          avgTransactionAmount: { $avg: '$netAmount' },
        },
      },
    ]);

    // Get earnings from tips
    const tipEarnings = await Tip.aggregate([
      {
        $match: {
          farmerId: new mongoose.Types.ObjectId(id),
          status: 'confirmed',
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$gross_amount' },
          totalNet: { $sum: '$net_amount' },
          totalFees: { $sum: '$platform_fee' },
          tipCount: { $sum: 1 },
        },
      },
    ]);

    // Get recent transactions
    const recentTransactions = await PaymentTransaction.find({
      farmerId: id,
      paymentStatus: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('lotId', 'lotNumber')
      .populate('buyerId', 'name email')
      .select('totalAmount netAmount transactionType createdAt lotId buyerId');

    // Get recent tips
    const recentTips = await Tip.find({
      farmerId: id,
      status: 'confirmed',
    })
      .sort({ payment_confirmed_at: -1 })
      .limit(5)
      .select('gross_amount net_amount buyer_metadata payment_confirmed_at');

    const sales = salesEarnings[0] || {
      totalGross: 0,
      totalNet: 0,
      transactionCount: 0,
      avgTransactionAmount: 0,
    };

    const tips = tipEarnings[0] || {
      totalGross: 0,
      totalNet: 0,
      totalFees: 0,
      tipCount: 0,
    };

    return NextResponse.json({
      sales: {
        totalGross: sales.totalGross,
        totalNet: sales.totalNet,
        transactionCount: sales.transactionCount,
        avgTransactionAmount: sales.avgTransactionAmount,
      },
      tips: {
        totalGross: tips.totalGross,
        totalNet: tips.totalNet,
        totalFees: tips.totalFees,
        tipCount: tips.tipCount,
      },
      totals: {
        totalEarnings: sales.totalNet + tips.totalNet,
        totalGross: sales.totalGross + tips.totalGross,
        totalDeductions: (sales.totalGross - sales.totalNet) + tips.totalFees,
      },
      recentTransactions,
      recentTips,
    });
  } catch (error) {
    console.error('Failed to fetch farmer earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data', details: error.message },
      { status: 500 }
    );
  }
}
