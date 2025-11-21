import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Loan from '../../../models/Loan';
import Wallet from '../../../models/Wallet';
import WalletTransaction from '../../../models/WalletTransaction';
import Farmer from '../../../models/Farmer';
import { authOptions } from '../../../lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

/**
 * GET /api/loans
 * List loans with filtering
 */
export async function GET(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query = {};

    // Non-admins can only see their own loans
    if (session.user.role !== 'admin') {
      query.userId = session.user.id;
    }

    if (status) {
      query.status = status;
    }

    const [loans, total] = await Promise.all([
      Loan.find(query)
        .populate('userId', 'name email')
        .populate('farmerId', 'name farmSize')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Loan.countDocuments(query),
    ]);

    return NextResponse.json({
      loans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/loans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loans
 * Request a new loan
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

    const { farmerId, principalAmount, purpose, dueDate, collateral } = body;

    if (!farmerId || !principalAmount || !purpose || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify farmer exists and belongs to user
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    if (farmer.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId: session.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: session.user.id });
      await wallet.save();
    }

    // Check credit eligibility
    if (wallet.outstandingLoanBalance > principalAmount * 2) {
      return NextResponse.json(
        { error: 'Outstanding loan balance too high. Please repay existing loans.' },
        { status: 400 }
      );
    }

    // Calculate interest (default 10% for pre-harvest loans)
    const interestRate = body.interestRate || 10;
    const interestAmount = (principalAmount * interestRate) / 100;
    const totalAmount = principalAmount + interestAmount;

    // Create loan
    const loan = new Loan({
      farmerId,
      userId: session.user.id,
      walletId: wallet._id,
      loanNumber: `LOAN-${uuidv4().slice(0, 8).toUpperCase()}`,
      principalAmount,
      interestRate,
      interestAmount,
      totalAmount,
      purpose,
      dueDate: new Date(dueDate),
      collateral,
      status: 'pending',
      amountOutstanding: totalAmount,
    });

    await loan.save();

    return NextResponse.json(
      { 
        message: 'Loan request submitted successfully. Awaiting approval.',
        loan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/loans error:', error);
    return NextResponse.json(
      { error: 'Failed to create loan', details: error.message },
      { status: 500 }
    );
  }
}
