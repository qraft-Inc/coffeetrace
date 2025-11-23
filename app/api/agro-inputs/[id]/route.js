import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import AgroInput from '../../../../models/AgroInput';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agro-inputs/[id]
 * Get a specific agro-input by ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const agroInput = await AgroInput.findById(id)
      .populate('cooperativeId', 'name location contactEmail contactPhone')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name')
      .lean();

    if (!agroInput) {
      return NextResponse.json(
        { error: 'Agro-input not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await AgroInput.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ agroInput });
  } catch (error) {
    console.error('GET /api/agro-inputs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agro-input', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agro-inputs/[id]
 * Update an agro-input (cooperative admin or system admin)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const agroInput = await AgroInput.findById(id);
    if (!agroInput) {
      return NextResponse.json(
        { error: 'Agro-input not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const isCoopAdmin = session.user.role === 'coopAdmin' && 
                        session.user.cooperativeId === agroInput.cooperativeId.toString();
    const isAdmin = session.user.role === 'admin';

    if (!isCoopAdmin && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // Admin can approve products
    if (isAdmin && body.status === 'active' && agroInput.status === 'pending_approval') {
      body.approvedBy = session.user.id;
      body.approvedAt = new Date();
    }

    Object.assign(agroInput, body);
    await agroInput.save();

    const updatedInput = await AgroInput.findById(id)
      .populate('cooperativeId', 'name location')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    return NextResponse.json({
      message: 'Agro-input updated successfully',
      agroInput: updatedInput,
    });
  } catch (error) {
    console.error('PATCH /api/agro-inputs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update agro-input', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agro-inputs/[id]
 * Delete an agro-input (cooperative admin or system admin)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const agroInput = await AgroInput.findById(id);
    if (!agroInput) {
      return NextResponse.json(
        { error: 'Agro-input not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const isCoopAdmin = session.user.role === 'coopAdmin' && 
                        session.user.cooperativeId === agroInput.cooperativeId.toString();
    const isAdmin = session.user.role === 'admin';

    if (!isCoopAdmin && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    await AgroInput.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Agro-input deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/agro-inputs/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete agro-input', details: error.message },
      { status: 500 }
    );
  }
}
