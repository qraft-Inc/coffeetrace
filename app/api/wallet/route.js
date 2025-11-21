import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Wallet from '../../../models/Wallet';
import WalletTransaction from '../../../models/WalletTransaction';
import { authOptions } from '../../../lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet
 * Get user's wallet information
 */
export async function GET(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Only admins can view other users' wallets
    if (userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let wallet = await Wallet.findOne({ userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // Get recent transactions
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ wallet, transactions });
  } catch (error) {
    console.error('GET /api/wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet
 * Create transaction (deposit, withdrawal, transfer)
 */
export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    const { type, amount, description, paymentMethod, externalReference } = body;

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, description' },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: session.user.id });
      await wallet.save();
    }

    const balanceBefore = wallet.balance;
    let balanceAfter = balanceBefore;

    // Calculate new balance based on transaction type
    if (['deposit', 'loan_disbursement', 'sale_payment', 'transfer_in', 'refund'].includes(type)) {
      balanceAfter = balanceBefore + amount;
    } else if (['withdrawal', 'purchase_payment', 'transfer_out', 'fee', 'loan_repayment'].includes(type)) {
      if (balanceBefore < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
      balanceAfter = balanceBefore - amount;
    }

    // Create transaction record
    const transaction = new WalletTransaction({
      walletId: wallet._id,
      userId: session.user.id,
      type,
      amount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      description,
      reference: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      paymentMethod,
      externalReference,
      status: 'completed',
      processedBy: session.user.id,
      processedAt: new Date(),
    });

    await transaction.save();

    // Update wallet balance
    wallet.balance = balanceAfter;
    wallet.availableBalance = balanceAfter - wallet.lockedBalance;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    return NextResponse.json(
      { 
        message: 'Transaction completed successfully',
        transaction,
        wallet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction', details: error.message },
      { status: 500 }
    );
  }
}
