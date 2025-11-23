'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { Package, Plus, Search, Filter, QrCode, MapPin, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

export default function FarmerLotsPage() {
  const [lots, setLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/lots/my-lots');
      // const data = await response.json();
      // setLots(data.lots);
      
      // Mock data
      setLots([
        {
          id: '1',
          traceId: 'LOT-2024-001',
          coffeeType: 'Arabica',
          quantity: 500,
          unit: 'kg',
          origin: 'Kigali, Rwanda',
          harvestDate: '2024-01-15',
          status: 'listed',
          qualityScore: 85,
          price: 4.50
        },
        {
          id: '2',
          traceId: 'LOT-2024-002',
          coffeeType: 'Bourbon',
          quantity: 750,
          unit: 'kg',
          origin: 'Huye, Rwanda',
          harvestDate: '2024-02-01',
          status: 'pending',
          qualityScore: 90,
          price: 5.20
        }
      ]);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.coffeeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lot.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      listed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <RequireAuth allowedRoles={['farmer']}>
      <DashboardLayout title="My Coffee Lots">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Lots</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{lots.length}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Listed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {lots.filter(l => l.status === 'listed').length}
                  </p>
                </div>
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {lots.filter(l => l.status === 'pending').length}
                  </p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Quantity</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {lots.reduce((sum, lot) => sum + lot.quantity, 0)} kg
                  </p>
                </div>
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Actions and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Trace ID or Coffee Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="listed">Listed</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <Link
                href="/dashboard/farmer/lots/create"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create New Lot
              </Link>
            </div>
          </div>

          {/* Lots Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading lots...</p>
            </div>
          ) : filteredLots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No lots found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLots.map((lot) => (
                <div key={lot.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lot.traceId}</h3>
                        <p className="text-sm text-gray-500">{lot.coffeeType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                        {lot.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>{lot.quantity} {lot.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{lot.origin}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(lot.harvestDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Quality Score</p>
                        <p className="text-lg font-bold text-green-600">{lot.qualityScore}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Price/kg</p>
                        <p className="text-lg font-bold text-gray-900">${lot.price}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <Link
                        href={`/lot/${lot.traceId}`}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/farmer/lots/${lot.id}/qr`}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        QR Code
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
