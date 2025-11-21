import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import PaymentTransaction from '@/models/PaymentTransaction';
import QualityAssessment from '@/models/QualityAssessment';
import Lot from '@/models/Lot';
import Wallet from '@/models/Wallet';
import WalletTransaction from '@/models/WalletTransaction';

/**
 * POST /api/payments/calculate
 * Calculate quality-based payment for a lot
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { lotId, basePrice, pricePerKg } = await req.json();

    if (!lotId || (!basePrice && !pricePerKg)) {
      return NextResponse.json(
        { error: 'Lot ID and price required' },
        { status: 400 }
      );
    }

    // Fetch lot details
    const lot = await Lot.findById(lotId)
      .populate('farmerId', 'fullName certifications')
      .lean();

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Calculate base price if pricePerKg provided
    const calculatedBasePrice = basePrice || (pricePerKg * lot.quantityKg);

    // Fetch quality assessments
    const qualityAssessments = await QualityAssessment.find({ lotId })
      .sort({ assessmentDate: -1 })
      .limit(5)
      .lean();

    let qualityScore = 0;
    let grade = null;

    if (qualityAssessments.length > 0) {
      // Use weighted average (recent assessments weighted more)
      const weights = [0.4, 0.3, 0.2, 0.1, 0.05];
      qualityScore = qualityAssessments.reduce((sum, assessment, index) => {
        const weight = weights[index] || 0.05;
        return sum + (assessment.qualityScore * weight);
      }, 0);
      grade = qualityAssessments[0].grade;
    }

    // Calculate premium
    const premiumCalc = PaymentTransaction.calculateQualityPremium(
      calculatedBasePrice,
      qualityScore,
      grade,
      lot.farmerId.certifications || []
    );

    return NextResponse.json({
      lotId,
      lotNumber: lot.lotNumber,
      weight: lot.quantityKg,
      farmer: lot.farmerId.fullName,
      basePrice: calculatedBasePrice,
      pricePerKg: pricePerKg || (calculatedBasePrice / lot.quantityKg),
      qualityScore: qualityScore.toFixed(1),
      grade,
      qualityPremium: premiumCalc,
      assessmentCount: qualityAssessments.length,
    });
  } catch (error) {
    console.error('Error calculating payment:', error);
    return NextResponse.json(
      { error: 'Failed to calculate payment' },
      { status: 500 }
    );
  }
}
