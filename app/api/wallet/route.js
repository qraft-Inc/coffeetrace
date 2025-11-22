import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Wallet from '@/models/Wallet';
import Farmer from '@/models/Farmer';
import { authOptions } from '@/lib/authOptions.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet
 * Get current user's wallet information
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get farmer profile
    const farmer = await Farmer.findOne({ userId: session.user.id });
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ farmerId: farmer._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        farmerId: farmer._id,
        balance: 0,
        currency: 'UGX',
      });

      // Update farmer with wallet reference
      farmer.walletId = wallet._id;
      await farmer.save();
    }

    return NextResponse.json({
      wallet: {
        walletId: wallet._id,
        balance: wallet.balance || 0,
        currency: wallet.currency || 'UGX',
        lastUpdated: wallet.lastUpdated,
      },
      farmer: {
        id: farmer._id,
        name: farmer.name,
        phoneNumber: farmer.phoneNumber,
      },
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/wallet
 * Update wallet information (admin only)
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { walletId, adjustment, reason } = body;

    if (!walletId || adjustment === undefined) {
      return NextResponse.json(
        { error: 'Wallet ID and adjustment amount required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const oldBalance = wallet.balance;
    wallet.balance = oldBalance + adjustment;
    wallet.lastUpdated = new Date();
    await wallet.save();

    // Log transaction
    const WalletTransaction = (await import('@/models/WalletTransaction')).default;
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.farmerId,
      type: adjustment > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(adjustment),
      currency: wallet.currency,
      balanceBefore: oldBalance,
      balanceAfter: wallet.balance,
      status: 'completed',
      description: reason || 'Manual adjustment by admin',
      reference: `ADJ-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        walletId: wallet._id,
        balance: wallet.balance,
        previousBalance: oldBalance,
        adjustment,
      },
    });

  } catch (error) {
    console.error('Update wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}
