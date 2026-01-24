import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import Buyer from '../../../models/Buyer';
import User from '../../../models/User';
import Cooperative from '../../../models/Cooperative';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};
    // Only coopAdmins can fetch their coop's buyers; admins can fetch any
    if (session.user.role === 'coopAdmin' && cooperativeId) {
      query.cooperativeId = cooperativeId;
    } else if (session.user.role === 'admin' && cooperativeId) {
      query.cooperativeId = cooperativeId;
    } else if (session.user.role === 'coopAdmin') {
      // Fallback: fetch by logged-in user's cooperative
      query.cooperativeId = session.user.cooperativeId;
    }

    const skip = (page - 1) * limit;
    const buyers = await Buyer.find(query)
      .populate('userId', 'email name phone')
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Buyer.countDocuments(query);

    return new Response(
      JSON.stringify({
        buyers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/buyers error:', error);
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
    const { companyName, businessType, email, phone, website, cooperativeId, address } = body;

    if (!companyName) {
      return new Response(JSON.stringify({ error: 'Company name required' }), { status: 400 });
    }

    // Validate cooperative access
    const targetCoopId = cooperativeId || session.user.cooperativeId;
    if (!targetCoopId) {
      return new Response(JSON.stringify({ error: 'Cooperative ID required' }), { status: 400 });
    }

    // For coopAdmins, ensure they're adding to their own cooperative
    if (session.user.role === 'coopAdmin' && cooperativeId && cooperativeId !== session.user.cooperativeId) {
      return new Response(JSON.stringify({ error: 'Cannot add to other cooperatives' }), { status: 403 });
    }

    const cooperative = await Cooperative.findById(targetCoopId);
    if (!cooperative) {
      return new Response(JSON.stringify({ error: 'Cooperative not found' }), { status: 404 });
    }

    // Create buyer without userId (or with guest userId if needed)
    const buyer = new Buyer({
      companyName,
      businessType: businessType || 'roaster',
      email,
      phone,
      website,
      cooperativeId: targetCoopId,
      address: address || {},
      verificationStatus: 'pending',
      stats: {
        totalPurchasesKg: 0,
        totalSpent: 0,
      },
    });

    await buyer.save();

    return new Response(JSON.stringify(buyer.toObject()), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/buyers error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
