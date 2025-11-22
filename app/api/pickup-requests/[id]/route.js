import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import PickupRequest from '@/models/PickupRequest';

/**
 * GET /api/pickup-requests/[id]
 * Fetch a single pickup request
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const pickupRequest = await PickupRequest.findById(params.id)
      .populate('farmerId', 'fullName location phoneNumber')
      .populate('lotId', 'lotNumber weight coffeeType')
      .populate('assignedTo.userId', 'fullName email phoneNumber')
      .populate('trackingUpdates.updatedBy', 'fullName')
      .lean();

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request not found' }, { status: 404 });
    }

    // Verify access
    if (
      session.user.role !== 'admin' &&
      session.user.role !== 'coopAdmin' &&
      pickupRequest.farmerId._id.toString() !== session.user.id &&
      pickupRequest.assignedTo?.userId?._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ pickupRequest });
  } catch (error) {
    console.error('Error fetching pickup request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pickup request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pickup-requests/[id]
 * Update pickup request (status, assignment, tracking)
 */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const pickupRequest = await PickupRequest.findById(params.id);
    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request not found' }, { status: 404 });
    }

    const updates = await req.json();

    // Handle status updates
    if (updates.status) {
      pickupRequest.status = updates.status;

      if (updates.status === 'completed') {
        pickupRequest.completedDate = new Date();
      }
    }

    // Handle assignment
    if (updates.assignedTo) {
      pickupRequest.assignedTo = {
        ...updates.assignedTo,
        assignedAt: new Date(),
      };
      pickupRequest.status = 'assigned';
    }

    // Handle tracking updates
    if (updates.trackingUpdate) {
      pickupRequest.trackingUpdates.push({
        ...updates.trackingUpdate,
        updatedBy: session.user.id,
        timestamp: new Date(),
      });
    }

    // Handle confirmations
    if (updates.pickupConfirmation) {
      pickupRequest.pickupConfirmation = {
        ...updates.pickupConfirmation,
        confirmedBy: session.user.id,
        timestamp: new Date(),
      };
      pickupRequest.status = 'in_transit';
    }

    if (updates.deliveryConfirmation) {
      pickupRequest.deliveryConfirmation = {
        ...updates.deliveryConfirmation,
        confirmedBy: session.user.id,
        timestamp: new Date(),
      };
      pickupRequest.status = 'completed';
      pickupRequest.completedDate = new Date();
      pickupRequest.actualWeight = updates.actualWeight || pickupRequest.estimatedWeight;
    }

    // Handle other updates
    if (updates.scheduledDate) pickupRequest.scheduledDate = updates.scheduledDate;
    if (updates.actualWeight) pickupRequest.actualWeight = updates.actualWeight;
    if (updates.transportCost) pickupRequest.transportCost = updates.transportCost;
    if (updates.routeDetails) pickupRequest.routeDetails = updates.routeDetails;
    if (updates.cancellationReason) {
      pickupRequest.cancellationReason = updates.cancellationReason;
      pickupRequest.status = 'cancelled';
    }

    await pickupRequest.save();

    await pickupRequest.populate([
      { path: 'farmerId', select: 'fullName location phoneNumber' },
      { path: 'lotId', select: 'lotNumber weight coffeeType' },
      { path: 'assignedTo.userId', select: 'fullName email phoneNumber' },
    ]);

    return NextResponse.json({ pickupRequest });
  } catch (error) {
    console.error('Error updating pickup request:', error);
    return NextResponse.json(
      { error: 'Failed to update pickup request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pickup-requests/[id]
 * Cancel/delete pickup request
 */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const pickupRequest = await PickupRequest.findById(params.id);
    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request not found' }, { status: 404 });
    }

    // Only farmer who created or admin can delete
    if (
      session.user.role !== 'admin' &&
      pickupRequest.farmerId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only delete pending requests
    if (pickupRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending requests' },
        { status: 400 }
      );
    }

    await pickupRequest.deleteOne();

    return NextResponse.json({ message: 'Pickup request deleted successfully' });
  } catch (error) {
    console.error('Error deleting pickup request:', error);
    return NextResponse.json(
      { error: 'Failed to delete pickup request' },
      { status: 500 }
    );
  }
}
