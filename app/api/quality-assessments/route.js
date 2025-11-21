import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import QualityAssessment from '@/models/QualityAssessment';
import Lot from '@/models/Lot';

/**
 * GET /api/quality-assessments
 * Fetch quality assessments with filters
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
    const farmerId = searchParams.get('farmerId');
    const assessmentType = searchParams.get('type');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    let query = {};
    
    // Role-based filtering
    if (session.user.role === 'farmer') {
      query.farmerId = session.user.id;
    } else if (session.user.role === 'buyer' && !lotId && !farmerId) {
      // Buyers must specify lot or farmer
      return NextResponse.json({ error: 'Lot or farmer ID required' }, { status: 400 });
    }

    if (lotId) query.lotId = lotId;
    if (farmerId) query.farmerId = farmerId;
    if (assessmentType) query.assessmentType = assessmentType;
    if (stage) query.stage = stage;

    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      QualityAssessment.find(query)
        .sort({ assessmentDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lotId', 'lotNumber weight coffeeType')
        .populate('farmerId', 'fullName location')
        .populate('assessor.userId', 'fullName email')
        .lean(),
      QualityAssessment.countDocuments(query),
    ]);

    return NextResponse.json({
      assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quality assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality assessments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quality-assessments
 * Create a new quality assessment
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only farmers, admins, and coopAdmins can create assessments
    if (!['farmer', 'admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const {
      lotId,
      assessmentType,
      stage,
      media,
      moistureLevel,
      temperature,
      defects,
      fermentation,
      drying,
      cupping,
      notes,
      location,
    } = data;

    // Validate lot exists
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Farmers can only assess their own lots
    if (session.user.role === 'farmer' && lot.farmerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate quality score based on defects and measurements
    let qualityScore = 100;
    
    // Deduct for defects
    if (defects && defects.length > 0) {
      defects.forEach(defect => {
        const deduction = {
          low: 2,
          medium: 5,
          high: 10,
          critical: 20,
        }[defect.severity] || 0;
        qualityScore -= deduction;
      });
    }

    // Deduct for moisture issues
    if (moistureLevel) {
      if (moistureLevel < 10 || moistureLevel > 13) {
        qualityScore -= 10;
      } else if (moistureLevel < 11 || moistureLevel > 12) {
        qualityScore -= 5;
      }
    }

    // Adjust for cupping score if provided
    if (cupping && cupping.totalScore) {
      qualityScore = cupping.totalScore;
    }

    qualityScore = Math.max(0, Math.min(100, qualityScore));

    // Determine grade
    let grade;
    if (qualityScore >= 85) grade = 'AA';
    else if (qualityScore >= 80) grade = 'A';
    else if (qualityScore >= 75) grade = 'B';
    else if (qualityScore >= 70) grade = 'C';
    else if (qualityScore >= 65) grade = 'PB';
    else grade = 'reject';

    // Generate alerts
    const alerts = [];
    
    if (moistureLevel > 13) {
      alerts.push({
        type: 'moisture_high',
        severity: 'high',
        message: 'Moisture level too high - risk of mould and quality degradation',
      });
    } else if (moistureLevel < 10) {
      alerts.push({
        type: 'moisture_low',
        severity: 'medium',
        message: 'Moisture level too low - beans may be over-dried',
      });
    }

    if (defects && defects.some(d => d.defectType === 'mould')) {
      alerts.push({
        type: 'mould_detected',
        severity: 'critical',
        message: 'Mould detected - immediate action required',
      });
    }

    if (defects && defects.filter(d => d.severity === 'high' || d.severity === 'critical').length > 0) {
      alerts.push({
        type: 'defect_high',
        severity: 'high',
        message: `${defects.filter(d => d.severity === 'high' || d.severity === 'critical').length} critical defects detected`,
      });
    }

    if (temperature && (temperature < 15 || temperature > 30)) {
      alerts.push({
        type: 'temperature_warning',
        severity: 'medium',
        message: 'Temperature outside optimal range',
      });
    }

    // Generate recommendations
    const recommendations = [];
    
    if (moistureLevel > 12) {
      recommendations.push('Continue drying to reach optimal moisture level (11-12%)');
    }
    
    if (defects && defects.some(d => d.defectType === 'unripe')) {
      recommendations.push('Improve cherry sorting during harvest to remove unripe beans');
    }
    
    if (defects && defects.some(d => d.defectType === 'insect_damage')) {
      recommendations.push('Check storage conditions and consider pest control measures');
    }

    // Create assessment
    const assessment = await QualityAssessment.create({
      lotId,
      farmerId: lot.farmerId,
      assessmentType,
      stage,
      media: media || [],
      moistureLevel,
      temperature,
      defects: defects || [],
      fermentation,
      drying,
      cupping,
      qualityScore,
      grade,
      alerts,
      recommendations,
      notes,
      assessor: {
        userId: session.user.id,
        role: session.user.role,
      },
      location,
    });

    // Populate for response
    await assessment.populate([
      { path: 'lotId', select: 'lotNumber weight coffeeType' },
      { path: 'farmerId', select: 'fullName location' },
      { path: 'assessor.userId', select: 'fullName email' },
    ]);

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error('Error creating quality assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create quality assessment' },
      { status: 500 }
    );
  }
}
