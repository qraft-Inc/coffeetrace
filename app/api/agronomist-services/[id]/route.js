import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/authOptions';
import AgronomistService from '../../../../models/AgronomistService';
import { dbConnect } from '../../../../lib/dbConnect';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const service = await AgronomistService.findById(params.id).lean();
    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(service), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/agronomist-services/[id] error:', error);
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

    const service = await AgronomistService.findById(params.id);
    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      qualifications,
      specializations,
      description,
      pricePerSession,
      priceModel,
      languages,
      topicsOfExpertise,
      status,
      availability,
    } = body;

    if (firstName) service.firstName = firstName;
    if (lastName) service.lastName = lastName;
    if (email) service.email = email;
    if (phone) service.phone = phone;
    if (qualifications) service.qualifications = qualifications;
    if (specializations) service.specializations = specializations;
    if (description) service.description = description;
    if (pricePerSession !== undefined) service.pricePerSession = parseFloat(pricePerSession);
    if (priceModel) service.priceModel = priceModel;
    if (languages) service.languages = languages;
    if (topicsOfExpertise) service.topicsOfExpertise = topicsOfExpertise;
    if (availability) service.availability = availability;
    if (status && ['active', 'inactive', 'on_leave'].includes(status)) {
      service.status = status;
    }

    await service.save();

    return new Response(JSON.stringify(service.toObject()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PUT /api/agronomist-services/[id] error:', error);
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

    const service = await AgronomistService.findById(params.id);
    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 });
    }

    await AgronomistService.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({ message: 'Service removed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/agronomist-services/[id] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
