import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const lot = await Lot.findById(id)
      .populate('farmerId', 'name email phone profilePhotoUrl cooperativeId')
      .populate('cooperativeId', 'name location address phone email certifications')
      .lean();

    if (!lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lot);
  } catch (error) {
    console.error('GET /api/lots/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lot', details: error.message },
      { status: 500 }
    );
  }
}
