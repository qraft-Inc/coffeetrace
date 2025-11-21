'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingDown, Package, CheckCircle, Clock } from 'lucide-react';

export default function GroupBuyingDashboard() {
  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    fetchGroupOrders();
  }, [filter]);

  const fetchGroupOrders = async () => {
    try {
      const response = await fetch(`/api/marketplace/group-orders?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setGroupOrders(data.groupOrders || []);
      }
    } catch (error) {
      console.error('Error fetching group orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroupOrder = async (groupOrderId, quantity) => {
    try {
      const response = await fetch('/api/marketplace/group-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupOrderId, quantity }),
      });

      if (response.ok) {
        alert('Successfully joined group order!');
        fetchGroupOrders();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join group order');
      }
    } catch (error) {
      console.error('Error joining group order:', error);
      alert('Failed to join group order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      target_reached: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateSavings = (price, discount) => {
    return (price * discount / 100).toFixed(0);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Group Buying
        </h2>
        <p className="text-green-100">
          Pool orders with other farmers for bulk discounts on inputs
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['open', 'target_reached', 'closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Group Orders Grid */}
      {groupOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No group orders available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupOrders.map((order) => {
            const progress = (order.currentQuantity / order.targetQuantity) * 100;
            const daysLeft = Math.ceil(
              (new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Product Header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {order.productId?.images?.[0]?.url && (
                        <img
                          src={order.productId.images[0].url}
                          alt={order.productId.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.productId?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Organized by {order.organizer?.name || order.organizer?.farmName}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Save per unit</p>
                      <p className="text-2xl font-bold text-green-700">
                        {calculateSavings(order.pricePerUnit, order.discountPercentage)} UGX
                      </p>
                      <p className="text-xs text-green-600">
                        {order.discountPercentage}% discount
                      </p>
                    </div>
                    <TrendingDown className="w-12 h-12 text-green-600 opacity-50" />
                  </div>
                </div>

                {/* Progress */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {order.currentQuantity} / {order.targetQuantity} {order.productId?.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {order.participants?.length || 0} farmers joined
                  </p>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                  </div>

                  {order.deliveryLocation && (
                    <div className="flex items-start text-sm text-gray-700">
                      <Package className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Delivery Location</p>
                        <p className="text-gray-600">
                          {order.deliveryLocation.district}
                          {order.deliveryLocation.address && `, ${order.deliveryLocation.address}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Price per unit</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(order.pricePerUnit * (1 - order.discountPercentage / 100)).toFixed(0)} UGX
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {order.pricePerUnit} UGX
                      </p>
                    </div>

                    {order.status === 'open' && daysLeft > 0 && (
                      <button
                        onClick={() => {
                          const quantity = prompt(`Enter quantity (${order.productId?.unit}):`);
                          if (quantity && parseInt(quantity) > 0) {
                            joinGroupOrder(order._id, parseInt(quantity));
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Join Group
                      </button>
                    )}

                    {order.status === 'target_reached' && (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Target Reached
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
