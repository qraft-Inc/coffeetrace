import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import AgronomistService from '../../../models/AgronomistService';
import Farmer from '../../../models/Farmer';
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
    const serviceType = searchParams.get('serviceType');
    const specialization = searchParams.get('specialization');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = { status: 'active', verificationStatus: 'verified' };

    // If farmer is requesting, show agronomists from their cooperative
    if (session.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ userId: session.user.id });
      if (farmer?.cooperativeId) {
        query.cooperativeId = farmer.cooperativeId;
      }
    } else if (cooperativeId) {
      // Admin or coopAdmin viewing specific cooperative
      query.cooperativeId = cooperativeId;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (specialization) {
      query.specializations = specialization;
    }

    const skip = (page - 1) * limit;
    const services = await AgronomistService.find(query)
      .select('firstName lastName phone email serviceType specializations stats profileImage topicsOfExpertise pricePerSession priceModel description')
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ 'stats.averageRating': -1, 'stats.completedSessions': -1 });

    const total = await AgronomistService.countDocuments(query);

    return new Response(
      JSON.stringify({
        services,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('GET /api/agronomist-services error:', error);
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
      agronomistId,
      firstName,
      lastName,
      email,
      phone,
      qualifications,
      specializations,
      serviceType,
      description,
      pricePerSession,
      priceModel,
      languages,
      topicsOfExpertise,
    } = body;

    if (!firstName || !lastName || !serviceType) {
      return new Response(
        JSON.stringify({ error: 'Name and service type required' }),
        { status: 400 }
      );
    }

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

    const service = new AgronomistService({
      cooperativeId: targetCoopId,
      agronomistId: agronomistId || session.user.id,
      firstName,
      lastName,
      email: email || session.user.email,
      phone,
      qualifications: qualifications || [],
      specializations: specializations || [],
      serviceType,
      description,
      pricePerSession: parseFloat(pricePerSession) || 0,
      priceModel: priceModel || 'fixed',
      languages: languages || [],
      topicsOfExpertise: topicsOfExpertise || [],
      status: 'active',
      verificationStatus: session.user.role === 'admin' ? 'verified' : 'pending',
    });

    await service.save();

    return new Response(JSON.stringify(service.toObject()), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/agronomist-services error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
