import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import WalletTransaction from '@/models/WalletTransaction';
import Wallet from '@/models/Wallet';
import Farmer from '@/models/Farmer';
import { authOptions } from '@/lib/authOptions.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/transactions
 * Get wallet transaction history for current user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'credit' or 'debit'
    const skip = (page - 1) * limit;

    await dbConnect();

    // Get farmer profile
    const farmer = await Farmer.findOne({ userId: session.user.id });
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }

    // Build query
    const query = { userId: session.user.id };
    if (type === 'credit' || type === 'debit') {
      query.type = type;
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .populate('relatedTip', 'tipId gross_amount buyer_metadata')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(query),
    ]);

    // Get current wallet balance
    const wallet = await Wallet.findOne({ farmerId: farmer._id });

    return NextResponse.json({
      transactions: transactions.map(tx => ({
        transactionId: tx.transactionId,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        status: tx.status,
        reference: tx.reference,
        createdAt: tx.createdAt,
        relatedTip: tx.relatedTip ? {
          tipId: tx.relatedTip.tipId,
          amount: tx.relatedTip.gross_amount,
          buyer: tx.relatedTip.buyer_metadata,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      currentBalance: wallet?.balance || 0,
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
