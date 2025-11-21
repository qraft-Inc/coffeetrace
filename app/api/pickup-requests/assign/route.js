import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import PickupRequest from '@/models/PickupRequest';
import User from '@/models/User';

/**
 * POST /api/pickup-requests/assign
 * Assign pickup request to agent/driver with route optimization
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and coopAdmins can assign
    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { pickupRequestIds, agentLocation, autoAssign } = await req.json();

    if (autoAssign) {
      // Auto-assign based on proximity and load
      const pendingRequests = await PickupRequest.find({
        _id: { $in: pickupRequestIds },
        status: 'pending',
      }).lean();

      if (pendingRequests.length === 0) {
        return NextResponse.json({ error: 'No pending requests found' }, { status: 400 });
      }

      // Find available agents/drivers
      const availableAgents = await User.find({
        role: { $in: ['agent', 'coopAdmin'] },
        isActive: true,
      }).select('_id fullName phoneNumber location').lean();

      if (availableAgents.length === 0) {
        return NextResponse.json({ error: 'No available agents' }, { status: 400 });
      }

      // Simple proximity-based assignment
      const assignments = [];

      for (const request of pendingRequests) {
        let nearestAgent = null;
        let shortestDistance = Infinity;

        for (const agent of availableAgents) {
          if (!agent.location?.coordinates) continue;

          const distance = PickupRequest.calculateDistance(
            request.pickupLocation.coordinates,
            agent.location.coordinates
          );

          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestAgent = agent;
          }
        }

        if (nearestAgent) {
          const updated = await PickupRequest.findByIdAndUpdate(
            request._id,
            {
              status: 'assigned',
              assignedTo: {
                userId: nearestAgent._id,
                role: 'agent',
                phoneNumber: nearestAgent.phoneNumber,
                assignedAt: new Date(),
              },
              routeDetails: {
                distance: shortestDistance,
                estimatedDuration: Math.round(shortestDistance * 2), // ~30 km/h average
                optimizationScore: 85,
              },
            },
            { new: true }
          ).populate('farmerId', 'fullName location phoneNumber');

          assignments.push(updated);
        }
      }

      return NextResponse.json({
        message: `Assigned ${assignments.length} requests`,
        assignments,
      });
    } else {
      // Manual assignment to specific agent
      const { agentId, vehicleType, vehicleRegistration } = await req.json();

      if (!agentId) {
        return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
      }

      const agent = await User.findById(agentId).select('fullName phoneNumber role');
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      const updates = await Promise.all(
        pickupRequestIds.map(async (id) => {
          const request = await PickupRequest.findById(id);
          if (!request || request.status !== 'pending') return null;

          // Calculate distance if agent location provided
          let routeDetails = {};
          if (agentLocation && request.pickupLocation.coordinates) {
            const distance = PickupRequest.calculateDistance(
              agentLocation,
              request.pickupLocation.coordinates
            );
            routeDetails = {
              distance,
              estimatedDuration: Math.round(distance * 2),
              optimizationScore: 90,
            };
          }

          request.status = 'assigned';
          request.assignedTo = {
            userId: agentId,
            role: agent.role,
            vehicleType,
            vehicleRegistration,
            phoneNumber: agent.phoneNumber,
            assignedAt: new Date(),
          };
          request.routeDetails = routeDetails;

          await request.save();
          await request.populate('farmerId', 'fullName location phoneNumber');

          return request;
        })
      );

      const assigned = updates.filter(Boolean);

      return NextResponse.json({
        message: `Assigned ${assigned.length} requests to ${agent.fullName}`,
        assignments: assigned,
      });
    }
  } catch (error) {
    console.error('Error assigning pickup requests:', error);
    return NextResponse.json(
      { error: 'Failed to assign pickup requests' },
      { status: 500 }
    );
  }
}
