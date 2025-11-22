import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import EUDRCompliance from '@/models/EUDRCompliance';
import Farmer from '@/models/Farmer';
import AuditLog from '@/models/AuditLog';

/**
 * GET /api/compliance/eudr
 * Fetch EUDR compliance records
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId');
    const lotId = searchParams.get('lotId');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    let query = {};
    
    // Role-based filtering
    if (session.user.role === 'farmer' && session.user.farmerProfile) {
      query.farmerId = session.user.farmerProfile;
    } else if (farmerId) {
      query.farmerId = farmerId;
    }

    if (lotId) query.lotId = lotId;
    if (status) query.overallStatus = status;
    if (riskLevel) query['deforestationRisk.riskLevel'] = riskLevel;

    const compliance = await EUDRCompliance.find(query)
      .populate('farmerId', 'name location farmSize')
      .populate('lotId', 'traceId variety quantityKg')
      .sort({ lastUpdated: -1 })
      .lean();

    return NextResponse.json({ compliance });
  } catch (error) {
    console.error('Error fetching EUDR compliance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/eudr
 * Create EUDR compliance assessment
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const { farmerId, lotId, geoLocation, deforestationRisk, dueDiligence, sustainabilityData, legalCompliance } = data;

    if (!farmerId || !geoLocation || !deforestationRisk) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    // Calculate compliance score
    let complianceScore = 100;
    if (deforestationRisk.riskLevel === 'high') complianceScore -= 40;
    else if (deforestationRisk.riskLevel === 'medium') complianceScore -= 20;
    else if (deforestationRisk.riskLevel === 'low') complianceScore -= 10;
    
    if (!legalCompliance?.landTitleVerified) complianceScore -= 20;
    if (!legalCompliance?.noConflicts) complianceScore -= 15;
    if (!sustainabilityData?.organicCertified) complianceScore -= 5;

    // Determine overall status
    let overallStatus = 'compliant';
    if (complianceScore < 60) overallStatus = 'non_compliant';
    else if (complianceScore < 80) overallStatus = 'conditional';

    const compliance = await EUDRCompliance.create({
      farmerId,
      lotId,
      geoLocation: {
        ...geoLocation,
        collectedBy: session.user.id,
        collectedAt: new Date(),
      },
      deforestationRisk: {
        ...deforestationRisk,
        assessmentDate: new Date(),
      },
      dueDiligence,
      sustainabilityData,
      legalCompliance,
      verificationHistory: [{
        verifiedBy: session.user.id,
        verificationDate: new Date(),
        verificationType: 'initial',
        result: overallStatus === 'compliant' ? 'compliant' : 'conditional',
      }],
      overallStatus,
      complianceScore,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    // Create audit log
    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'eudr_assessment_created',
      actionCategory: 'compliance',
      resourceType: 'EUDRCompliance',
      resourceId: compliance._id,
      resourceIdentifier: farmer.name,
      description: `EUDR compliance assessment created for ${farmer.name} with ${overallStatus} status`,
      compliance: {
        eudrRelevant: true,
      },
      result: 'success',
    });

    return NextResponse.json({ compliance }, { status: 201 });
  } catch (error) {
    console.error('Error creating EUDR compliance:', error);
    return NextResponse.json(
      { error: 'Failed to create compliance record' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/compliance/eudr
 * Update compliance verification
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { complianceId, verificationType, result, findings, correctiveActions } = await req.json();

    if (!complianceId || !verificationType || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const compliance = await EUDRCompliance.findById(complianceId);
    if (!compliance) {
      return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 });
    }

    compliance.verificationHistory.push({
      verifiedBy: session.user.id,
      verificationDate: new Date(),
      verificationType,
      result,
      findings,
      correctiveActions,
      nextVerificationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    compliance.overallStatus = result;
    compliance.lastUpdated = new Date();
    await compliance.save();

    // Create audit log
    await AuditLog.log({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'eudr_verification_completed',
      actionCategory: 'compliance',
      resourceType: 'EUDRCompliance',
      resourceId: compliance._id,
      description: `EUDR verification completed with ${result} result`,
      compliance: {
        eudrRelevant: true,
      },
      result: 'success',
    });

    return NextResponse.json({ compliance });
  } catch (error) {
    console.error('Error updating EUDR compliance:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance record' },
      { status: 500 }
    );
  }
}
