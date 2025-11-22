import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lots/[lotId]
 * Get lot details with farmer information for traceability
 */
export async function GET(request, { params }) {
  try {
    const { lotId } = params;

    if (!lotId) {
      return NextResponse.json(
        { error: 'Lot ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const lot = await Lot.findById(lotId)
      .populate('farmerId', 'name location certifications profilePhotoUrl qrCodeUrl phoneNumber')
      .populate('cooperativeId', 'name location')
      .lean();

    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lot: {
        id: lot._id,
        traceId: lot.traceId,
        variety: lot.variety,
        quantityKg: lot.quantityKg,
        harvestDate: lot.harvestDate,
        moisture: lot.moisture,
        qualityScore: lot.qualityScore,
        status: lot.status,
        qrCodeUrl: lot.qrCodeUrl,
        events: lot.events || [],
        notes: lot.notes,
        tags: lot.tags || [],
        carbonFootprint: lot.carbonFootprint,
        farmer: lot.farmerId ? {
          id: lot.farmerId._id,
          name: lot.farmerId.name,
          location: lot.farmerId.location,
          certifications: lot.farmerId.certifications || [],
          profilePhotoUrl: lot.farmerId.profilePhotoUrl,
          qrCodeUrl: lot.farmerId.qrCodeUrl,
          phoneNumber: lot.farmerId.phoneNumber,
        } : null,
        cooperative: lot.cooperativeId ? {
          id: lot.cooperativeId._id,
          name: lot.cooperativeId.name,
          location: lot.cooperativeId.location,
        } : null,
      },
    });

  } catch (error) {
    console.error('Get lot error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
