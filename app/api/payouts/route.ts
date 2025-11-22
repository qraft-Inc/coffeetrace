import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Payout from '@/models/Payout';
import Wallet from '@/models/Wallet';
import Farmer from '@/models/Farmer';
import { authOptions } from '@/lib/authOptions.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/payouts
 * Get payout history for current user
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
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
    const query: any = { farmerId: farmer._id };
    if (status) {
      query.status = status;
    }

    // Fetch payouts
    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payout.countDocuments(query),
    ]);

    return NextResponse.json({
      payouts: payouts.map(payout => ({
        payoutId: payout.payoutId,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        destination: payout.destination,
        psp_reference: payout.psp_reference,
        failure_reason: payout.failure_reason,
        retry_count: payout.retry_count,
        initiated_at: payout.initiated_at,
        executed_at: payout.executed_at,
        completed_at: payout.completed_at,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get payouts error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch payouts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payouts
 * Request a manual payout (if enabled)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, msisdn } = body;

    await dbConnect();

    // Get farmer profile
    const farmer = await Farmer.findOne({ userId: session.user.id });
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer profile not found' },
        { status: 404 }
      );
    }

    // Get wallet
    const wallet = await Wallet.findOne({ farmerId: farmer._id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Validate amount
    const requestedAmount = parseFloat(amount);
    const MIN_PAYOUT = parseFloat(process.env.MIN_PAYOUT_THRESHOLD || '50000');

    if (requestedAmount < MIN_PAYOUT) {
      return NextResponse.json(
        {
          error: `Minimum payout amount is ${MIN_PAYOUT} ${wallet.currency}`,
        },
        { status: 400 }
      );
    }

    if (requestedAmount > wallet.balance) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          available: wallet.balance,
          requested: requestedAmount,
        },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneNumber = msisdn || farmer.phoneNumber;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required for payout' },
        { status: 400 }
      );
    }

    // Create payout request
    const payout = await Payout.create({
      farmerId: farmer._id,
      walletId: wallet._id,
      amount: requestedAmount,
      currency: wallet.currency,
      destination: {
        type: 'mobile_money',
        msisdn: phoneNumber,
      },
      status: 'pending',
    });

    // Process payout immediately
    const { sendMobileMoneyPayout } = await import('@/lib/onafriq/payouts');
    const payoutResult = await sendMobileMoneyPayout({
      farmerId: farmer._id.toString(),
      amount: requestedAmount,
      currency: wallet.currency,
      msisdn: phoneNumber,
      reference: payout.payoutId,
      description: 'Manual payout request',
    });

    if (payoutResult.success) {
      // Update payout record
      payout.status = 'processing';
      payout.psp_reference = payoutResult.psp_reference;
      payout.executed_at = new Date();
      await payout.save();

      // Deduct from wallet
      wallet.balance -= requestedAmount;
      wallet.lastUpdated = new Date();
      await wallet.save();

      // Log transaction
      const WalletTransaction = (await import('@/models/WalletTransaction')).default;
      await WalletTransaction.create({
        walletId: wallet._id,
        userId: session.user.id,
        type: 'withdrawal',
        amount: requestedAmount,
        currency: wallet.currency,
        balanceBefore: wallet.balance + requestedAmount,
        balanceAfter: wallet.balance,
        status: 'completed',
        description: 'Manual payout request',
        reference: payout.payoutId,
      });

      return NextResponse.json({
        success: true,
        payout: {
          payoutId: payout.payoutId,
          amount: payout.amount,
          status: payout.status,
          psp_reference: payout.psp_reference,
        },
        newBalance: wallet.balance,
      });
    } else {
      // Mark payout as failed
      payout.status = 'failed';
      payout.failure_reason = payoutResult.error;
      await payout.save();

      return NextResponse.json(
        {
          error: 'Payout failed',
          details: payoutResult.error,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request payout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process payout request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
