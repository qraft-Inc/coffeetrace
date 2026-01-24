import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/authOptions';
import FinancePartner from '../../../../models/FinancePartner';
import AuditTrail from '../../../../models/AuditTrail';
import { dbConnect } from '../../../../lib/dbConnect';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const partner = await FinancePartner.findById(params.id).lean();
    if (!partner) {
      return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      partner.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    return new Response(JSON.stringify(partner), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/finance-partners/[id] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !['coopAdmin', 'admin'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const partner = await FinancePartner.findById(params.id);
    if (!partner) {
      return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      partner.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const body = await req.json();
    const {
      name,
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
      status,
    } = body;

    if (name) partner.name = name;
    if (description !== undefined) partner.description = description;
    if (email) partner.email = email;
    if (phone) partner.phone = phone;
    if (website) partner.website = website;
    if (location) partner.location = location;
    if (loanProducts) partner.loanProducts = loanProducts;
    if (maxLoanAmount !== undefined) partner.maxLoanAmount = maxLoanAmount;
    if (processingFee !== undefined) partner.processingFee = processingFee;
    if (eligibilityCriteria) partner.eligibilityCriteria = eligibilityCriteria;
    if (contactPerson) partner.contactPerson = contactPerson;
    if (status && ['active', 'inactive', 'pending', 'suspended'].includes(status)) {
      partner.status = status;
    }

    await partner.save();

    // Log audit trail
    try {
      await AuditTrail.create({
        action: 'UPDATE',
        entityType: 'FinancePartner',
        entityId: params.id,
        userId: session.user.id,
        changes: { updated: Object.keys(body).join(', ') },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return new Response(JSON.stringify(partner.toObject()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PUT /api/finance-partners/[id] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !['coopAdmin', 'admin'].includes(session.user.role)) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const partner = await FinancePartner.findById(params.id);
    if (!partner) {
      return new Response(JSON.stringify({ error: 'Partner not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      partner.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    await FinancePartner.findByIdAndDelete(params.id);

    // Log audit trail (non-blocking)
    try {
      await AuditTrail.create({
        action: 'DELETE',
        entityType: 'FinancePartner',
        entityId: params.id,
        userId: session.user.id,
        changes: { deleted: partner.name },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return new Response(JSON.stringify({ message: 'Partner removed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/finance-partners/[id] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
