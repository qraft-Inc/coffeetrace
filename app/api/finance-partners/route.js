import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import FinancePartner from '../../../models/FinancePartner';
import Cooperative from '../../../models/Cooperative';
import AuditTrail from '../../../models/AuditTrail';
import { dbConnect } from '../../../lib/dbConnect';

export async function GET(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cooperativeId = searchParams.get('cooperativeId');
    const partnerType = searchParams.get('partnerType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};

    // Only coopAdmins can fetch their coop's partners; admins can fetch any
    if (session.user.role === 'coopAdmin' && cooperativeId) {
      query.cooperativeId = cooperativeId;
    } else if (session.user.role === 'admin' && cooperativeId) {
      query.cooperativeId = cooperativeId;
    } else if (session.user.role === 'coopAdmin') {
      query.cooperativeId = session.user.cooperativeId;
    }

    if (partnerType) {
      query.partnerType = partnerType;
    }

    const skip = (page - 1) * limit;
    const partners = await FinancePartner.find(query)
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await FinancePartner.countDocuments(query);

    return new Response(
      JSON.stringify({
        partners,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/finance-partners error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !['coopAdmin', 'admin'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const body = await req.json();
    const {
      cooperativeId,
      name,
      partnerType,
      description,
      email,
      phone,
      website,
      location,
      loanProducts,
      maxLoanAmount,
      processingFee,
      eligibilityCriteria,
      contactPerson,
    } = body;

    if (!name || !partnerType) {
      return new Response(
        JSON.stringify({ error: 'Name and partner type required' }),
        { status: 400 }
      );
    }

    // Validate cooperative access
    const targetCoopId = cooperativeId || session.user.cooperativeId;
    if (!targetCoopId) {
      return new Response(
        JSON.stringify({ error: 'Cooperative ID required' }),
        { status: 400 }
      );
    }

    // For coopAdmins, ensure they're adding to their own cooperative
    if (session.user.role === 'coopAdmin' && cooperativeId && cooperativeId !== session.user.cooperativeId) {
      return new Response(
        JSON.stringify({ error: 'Cannot add to other cooperatives' }),
        { status: 403 }
      );
    }

    const cooperative = await Cooperative.findById(targetCoopId);
    if (!cooperative) {
      return new Response(JSON.stringify({ error: 'Cooperative not found' }), { status: 404 });
    }

    const partner = new FinancePartner({
      cooperativeId: targetCoopId,
      name,
      partnerType,
      description,
      email,
      phone,
      website,
      location: location || {},
      loanProducts: loanProducts || [],
      maxLoanAmount: maxLoanAmount || 0,
      processingFee: processingFee || 0,
      eligibilityCriteria: eligibilityCriteria || [],
      contactPerson: contactPerson || {},
      status: 'active',
      verificationStatus: session.user.role === 'admin' ? 'verified' : 'unverified',
    });

    await partner.save();

    // Log audit trail
    try {
      await AuditTrail.create({
        action: 'CREATE',
        entityType: 'FinancePartner',
        entityId: partner._id,
        userId: session.user.id,
        changes: { created: name },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return new Response(JSON.stringify(partner.toObject()), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/finance-partners error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
