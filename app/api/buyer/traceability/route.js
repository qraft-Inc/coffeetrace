import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';
import Farmer from '@/models/Farmer';
import QualityAssessment from '@/models/QualityAssessment';
import { WetMillProcessing, DryMillProcessing, DryingRecord } from '@/models/ProcessingRecord';
import EUDRCompliance from '@/models/EUDRCompliance';

/**
 * GET /api/buyer/traceability
 * Comprehensive traceability for buyers
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const lotId = searchParams.get('lotId');
    const traceId = searchParams.get('traceId');

    if (!lotId && !traceId) {
      return NextResponse.json({ error: 'Lot ID or Trace ID required' }, { status: 400 });
    }

    // Find lot
    const lot = await Lot.findOne(lotId ? { _id: lotId } : { traceId })
      .populate('farmerId')
      .populate('cooperativeId', 'name certifications')
      .lean();

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Get farmer details with farm mapping
    const farmer = await Farmer.findOne({ userId: lot.farmerId._id })
      .select('name location farmBoundary farmSize altitude soilType climateZone varieties certifications photos kycStatus')
      .lean();

    // Get quality assessments
    const qualityAssessments = await QualityAssessment.find({ lotId: lot._id })
      .sort({ assessmentDate: -1 })
      .lean();

    // Get processing records
    const [wetMill, dryMill, drying] = await Promise.all([
      WetMillProcessing.find({ lotId: lot._id }).sort({ startDate: -1 }).lean(),
      DryMillProcessing.find({ lotId: lot._id }).sort({ startDate: -1 }).lean(),
      DryingRecord.find({ lotId: lot._id }).sort({ startDate: -1 }).lean(),
    ]);

    // Get EUDR compliance
    const eudrCompliance = await EUDRCompliance.findOne({ lotId: lot._id })
      .select('-verificationHistory')
      .lean();

    // Compile traceability data
    const traceability = {
      lot: {
        ...lot,
        farmerId: undefined, // Remove populated field
        cooperativeId: lot.cooperativeId,
      },
      farmer: {
        ...farmer,
        userId: undefined, // Don't expose user ID
      },
      farm: {
        location: farmer?.location,
        boundary: farmer?.farmBoundary,
        size: farmer?.farmSize,
        altitude: farmer?.altitude,
        soilType: farmer?.soilType,
        climateZone: farmer?.climateZone,
        varieties: farmer?.varieties,
        photos: farmer?.photos,
      },
      quality: {
        assessments: qualityAssessments,
        latestScore: qualityAssessments[0]?.overallScore,
        latestGrade: qualityAssessments[0]?.grade,
        avgScore: qualityAssessments.length > 0
          ? qualityAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / qualityAssessments.length
          : 0,
      },
      processing: {
        wetMill: wetMill[0] || null,
        dryMill: dryMill[0] || null,
        drying: drying[0] || null,
        method: lot.processingMethod,
      },
      compliance: {
        eudr: eudrCompliance ? {
          status: eudrCompliance.overallStatus,
          deforestationRisk: eudrCompliance.deforestationRisk.riskLevel,
          complianceScore: eudrCompliance.complianceScore,
          sustainability: eudrCompliance.sustainabilityData,
        } : null,
        certifications: farmer?.certifications || [],
        kycVerified: farmer?.kycStatus === 'verified',
      },
      timeline: lot.events || [],
    };

    return NextResponse.json({ traceability });
  } catch (error) {
    console.error('Error fetching traceability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traceability data' },
      { status: 500 }
    );
  }
}
