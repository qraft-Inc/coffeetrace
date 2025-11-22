import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Farmer from '@/models/Farmer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/farmers/[farmerId]
 * Get farmer details by ID
 */
export async function GET(request, { params }) {
  try {
    const { farmerId } = params;

    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const farmer = await Farmer.findById(farmerId)
      .select(
        'name location address farmSize certifications profilePhotoUrl qrCodeUrl phoneNumber email phone cooperativeId'
      )
      .populate('cooperativeId', 'name location')
      .lean();

    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      farmer: {
        id: farmer._id,
        name: farmer.name,
        location: farmer.location,
        address: farmer.address,
        farmSize: farmer.farmSize,
        certifications: farmer.certifications || [],
        profilePhotoUrl: farmer.profilePhotoUrl,
        qrCodeUrl: farmer.qrCodeUrl,
        phoneNumber: farmer.phoneNumber,
        email: farmer.email,
        phone: farmer.phone,
        cooperative: farmer.cooperativeId
          ? {
              id: farmer.cooperativeId._id,
              name: farmer.cooperativeId.name,
              location: farmer.cooperativeId.location,
            }
          : null,
      },
    });

  } catch (error) {
    console.error('Get farmer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch farmer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
