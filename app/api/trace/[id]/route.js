import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';
import QualityAssessment from '@/models/QualityAssessment';

/**
 * GET /api/trace/[id]
 * Public traceability information for a lot
 */
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const lot = await Lot.findById(params.id)
      .populate('farmerId', 'fullName location farmSize cooperativeName certifications')
      .populate('buyerId', 'fullName companyName')
      .lean();

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Fetch quality assessments for this lot
    const qualityAssessments = await QualityAssessment.find({ lotId: params.id })
      .sort({ assessmentDate: -1 })
      .select('assessmentType stage qualityScore grade moistureLevel assessmentDate')
      .lean();

    // Build traceability data
    const traceabilityData = {
      lot: {
        lotNumber: lot.lotNumber,
        coffeeType: lot.coffeeType,
        processingMethod: lot.processingMethod,
        weight: lot.weight,
        harvestDate: lot.harvestDate,
        status: lot.status,
        certifications: lot.certifications,
      },
      farmer: {
        name: lot.farmerId.fullName,
        location: lot.farmerId.location,
        farmSize: lot.farmerId.farmSize,
        cooperative: lot.farmerId.cooperativeName,
        certifications: lot.farmerId.certifications,
      },
      buyer: lot.buyerId ? {
        name: lot.buyerId.companyName || lot.buyerId.fullName,
      } : null,
      journey: {
        harvest: lot.harvestDate,
        processing: lot.processingDate,
        grading: lot.gradingDate,
        export: lot.exportDate,
      },
      quality: {
        averageScore: qualityAssessments.length > 0
          ? (qualityAssessments.reduce((sum, a) => sum + a.qualityScore, 0) / qualityAssessments.length).toFixed(1)
          : null,
        latestGrade: qualityAssessments[0]?.grade || null,
        assessments: qualityAssessments.map(a => ({
          type: a.assessmentType,
          stage: a.stage,
          score: a.qualityScore,
          grade: a.grade,
          moisture: a.moistureLevel,
          date: a.assessmentDate,
        })),
      },
      certifications: [
        ...(lot.certifications || []),
        ...(lot.farmerId.certifications || []),
      ].filter((v, i, a) => a.indexOf(v) === i), // unique
    };

    return NextResponse.json({ traceability: traceabilityData });
  } catch (error) {
    console.error('Error fetching traceability data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traceability data' },
      { status: 500 }
    );
  }
}
