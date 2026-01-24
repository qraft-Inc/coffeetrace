import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/authOptions';
import Buyer from '../../../../models/Buyer';
import AuditTrail from '../../../../models/AuditTrail';
import { dbConnect } from '../../../../lib/dbConnect';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const buyer = await Buyer.findById(params.id).populate('userId', 'email name phone').lean();
    if (!buyer) {
      return new Response(JSON.stringify({ error: 'Buyer not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      buyer.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    return new Response(JSON.stringify(buyer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/buyers/[id] error:', error);
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

    const buyer = await Buyer.findById(params.id);
    if (!buyer) {
      return new Response(JSON.stringify({ error: 'Buyer not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      buyer.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const body = await req.json();
    const { companyName, businessType, email, phone, website, address, verificationStatus } = body;

    if (companyName) buyer.companyName = companyName;
    if (businessType) buyer.businessType = businessType;
    if (email) buyer.email = email;
    if (phone) buyer.phone = phone;
    if (website) buyer.website = website;
    if (address) buyer.address = address;
    if (verificationStatus) buyer.verificationStatus = verificationStatus;

    await buyer.save();

    // Log audit trail
    try {
      await AuditTrail.create({
        action: 'UPDATE',
        entityType: 'Buyer',
        entityId: params.id,
        userId: session.user.id,
        changes: { updated: Object.keys(body).join(', ') },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return new Response(JSON.stringify(buyer.toObject()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PUT /api/buyers/[id] error:', error);
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

    const buyer = await Buyer.findById(params.id);
    if (!buyer) {
      return new Response(JSON.stringify({ error: 'Buyer not found' }), { status: 404 });
    }

    // Verify cooperative access
    if (
      session.user.role === 'coopAdmin' &&
      buyer.cooperativeId.toString() !== session.user.cooperativeId
    ) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    await Buyer.findByIdAndDelete(params.id);

    // Log audit trail (non-blocking)
    try {
      await AuditTrail.create({
        action: 'DELETE',
        entityType: 'Buyer',
        entityId: params.id,
        userId: session.user.id,
        changes: { deleted: buyer.companyName },
        timestamp: new Date(),
      });
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return new Response(JSON.stringify({ message: 'Buyer removed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/buyers/[id] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
