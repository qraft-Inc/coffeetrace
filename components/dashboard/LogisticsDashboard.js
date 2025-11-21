'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, Calendar, Clock, Package, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function LogisticsDashboard({ userRole, userId }) {
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchPickupRequests();
  }, [filter]);

  const fetchPickupRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (userRole === 'agent') params.append('assignedTo', 'me');

      const res = await fetch(`/api/pickup-requests?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setPickupRequests(data.pickupRequests);
      }
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    };
    return colors[urgency] || 'text-gray-600';
  };

  const stats = {
    total: pickupRequests.length,
    pending: pickupRequests.filter(r => r.status === 'pending').length,
    assigned: pickupRequests.filter(r => r.status === 'assigned').length,
    in_transit: pickupRequests.filter(r => r.status === 'in_transit').length,
    completed: pickupRequests.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-700">Assigned</p>
          <p className="text-2xl font-bold text-blue-900">{stats.assigned}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-700">In Transit</p>
          <p className="text-2xl font-bold text-purple-900">{stats.in_transit}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-700">Completed</p>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'assigned', 'in_transit', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Pickup Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-green-600" />
            Pickup Requests
          </h3>

          {pickupRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pickup requests found</p>
          ) : (
            <div className="space-y-4">
              {pickupRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {request.farmerId?.fullName}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {request.estimatedWeight} kg · {request.coffeeType}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(request.requestedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {request.pickupLocation.address.district}, {request.pickupLocation.address.sector || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {request.preferredTimeSlot}
                        </div>
                      </div>

                      {request.assignedTo?.userId && (
                        <div className="mt-2 flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">
                          <User className="w-4 h-4 mr-1" />
                          Assigned to: {request.assignedTo.userId.fullName}
                        </div>
                      )}

                      {request.routeDetails?.distance && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Route:</span> {request.routeDetails.distance.toFixed(1)} km · 
                          Est. {request.routeDetails.estimatedDuration} min
                        </div>
                      )}

                      {request.specialInstructions && (
                        <div className="mt-2 text-sm text-gray-600 italic">
                          "{request.specialInstructions}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4">
                      {userRole === 'admin' && request.status === 'pending' && (
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Assign
                        </button>
                      )}
                      {userRole === 'agent' && request.status === 'assigned' && (
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Start
                        </button>
                      )}
                      {request.status === 'in_transit' && (
                        <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                          Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tracking Updates */}
                  {request.trackingUpdates && request.trackingUpdates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recent Updates:</p>
                      <div className="space-y-1">
                        {request.trackingUpdates.slice(-2).map((update, idx) => (
                          <div key={idx} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>
                              {update.status} - {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
