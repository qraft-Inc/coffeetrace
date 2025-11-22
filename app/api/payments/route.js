import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import PaymentTransaction from '@/models/PaymentTransaction';
import QualityAssessment from '@/models/QualityAssessment';
import Lot from '@/models/Lot';
import Wallet from '@/models/Wallet';
import WalletTransaction from '@/models/WalletTransaction';

/**
 * GET /api/payments
 * Fetch payment transactions
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const farmerId = searchParams.get('farmerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let query = {};

    if (session.user.role === 'farmer') {
      query.farmerId = session.user.id;
    } else if (session.user.role === 'buyer') {
      query.buyerId = session.user.id;
    } else if (farmerId && ['admin', 'coopAdmin'].includes(session.user.role)) {
      query.farmerId = farmerId;
    }

    if (status) query.paymentStatus = status;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      PaymentTransaction.find(query)
        .sort({ initiatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('farmerId', 'fullName phoneNumber')
        .populate('buyerId', 'fullName companyName')
        .populate('lotId', 'lotNumber quantityKg coffeeType')
        .lean(),
      PaymentTransaction.countDocuments(query),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Create a new payment transaction
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only buyers, admins, and coopAdmins can create payments
    if (!['buyer', 'admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const {
      lotId,
      transactionType,
      basePrice,
      pricePerKg,
      paymentMethod,
      deductions,
      notes,
      autoCalculateQuality,
    } = data;

    // Fetch lot
    const lot = await Lot.findById(lotId)
      .populate('farmerId', 'certifications phoneNumber')
      .lean();

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Calculate base price
    const calculatedBasePrice = basePrice || (pricePerKg * lot.quantityKg);

    let qualityPremium = {
      premiumMultiplier: 1.0,
      premiumAmount: 0,
      breakdown: [],
    };
    let certificationBonuses = [];
    let qualityAssessmentIds = [];

    if (autoCalculateQuality !== false) {
      // Fetch quality assessments
      const assessments = await QualityAssessment.find({ lotId })
        .sort({ assessmentDate: -1 })
        .limit(5)
        .lean();

      if (assessments.length > 0) {
        qualityAssessmentIds = assessments.map(a => a._id);

        // Calculate weighted quality score
        const weights = [0.4, 0.3, 0.2, 0.1, 0.05];
        const qualityScore = assessments.reduce((sum, assessment, index) => {
          const weight = weights[index] || 0.05;
          return sum + (assessment.qualityScore * weight);
        }, 0);
        const grade = assessments[0].grade;

        // Calculate premium
        const premiumCalc = PaymentTransaction.calculateQualityPremium(
          calculatedBasePrice,
          qualityScore,
          grade,
          lot.farmerId.certifications || []
        );

        qualityPremium = {
          qualityScore,
          grade,
          premiumMultiplier: premiumCalc.premiumMultiplier,
          premiumAmount: premiumCalc.premiumAmount,
          breakdown: premiumCalc.breakdown,
        };
        certificationBonuses = premiumCalc.certificationBonuses;
      }
    }

    // Calculate total and net amounts
    const totalAmount = calculatedBasePrice + qualityPremium.premiumAmount +
                       (certificationBonuses.reduce((sum, b) => sum + b.bonusAmount, 0));
    
    const totalDeductions = (deductions || []).reduce((sum, d) => sum + d.amount, 0);
    const netAmount = totalAmount - totalDeductions;

    // Create payment transaction
    const payment = await PaymentTransaction.create({
      farmerId: lot.farmerId._id,
      buyerId: session.user.id,
      lotId,
      transactionType: transactionType || 'sale',
      basePrice: {
        amount: calculatedBasePrice,
        currency: 'RWF',
        pricePerKg: pricePerKg || (calculatedBasePrice / lot.quantityKg),
      },
      qualityPremium,
      certificationBonuses,
      deductions: deductions || [],
      totalAmount,
      netAmount,
      paymentMethod,
      paymentStatus: 'pending',
      qualityAssessmentIds,
      notes,
      approvalRequired: netAmount > 1000000, // Require approval for payments > 1M RWF
    });

    await payment.populate([
      { path: 'farmerId', select: 'fullName phoneNumber' },
      { path: 'buyerId', select: 'fullName companyName' },
      { path: 'lotId', select: 'lotNumber quantityKg coffeeType' },
    ]);

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
