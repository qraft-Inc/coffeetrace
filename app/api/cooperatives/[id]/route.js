import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../../lib/dbConnect';
import Cooperative from '../../../../models/Cooperative';
import Farmer from '../../../../models/Farmer';

/**
 * GET /api/cooperatives/[id]
 * Get a single cooperative with its farmers
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const cooperative = await Cooperative.findById(id)
      .populate('adminUserId', 'name email phone')
      .lean();

    if (!cooperative) {
      return NextResponse.json(
        { success: false, message: 'Cooperative not found' },
        { status: 404 }
      );
    }

    // Get farmers in this cooperative
    const farmers = await Farmer.find({ cooperativeId: id })
      .select('farmerName email phone farmSize location profileImage userId')
      .populate('userId', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      cooperative: {
        ...cooperative,
        farmers,
        farmerCount: farmers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cooperative:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cooperative', error: error.message },
      { status: 500 }
    );
  }
}
