'use client';

import { Package, Filter, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CoopLotsPage() {
  const lots = [
    {
      id: 1,
      traceId: 'CT2024001',
      farmer: 'John Kamau',
      variety: 'Arabica SL28',
      weight: 500,
      status: 'listed',
      harvestDate: '2024-11-10',
      price: 2100,
    },
    {
      id: 2,
      traceId: 'CT2024015',
      farmer: 'Mary Wanjiru',
      variety: 'Ruiru 11',
      weight: 300,
      status: 'sold',
      harvestDate: '2024-11-05',
      price: 1350,
    },
    {
      id: 3,
      traceId: 'CT2024008',
      farmer: 'Peter Mwangi',
      variety: 'Batian',
      weight: 450,
      status: 'available',
      harvestDate: '2024-11-12',
      price: 1890,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      listed: 'bg-blue-100 text-blue-800',
      sold: 'bg-gray-100 text-gray-800',
      processing: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lots Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor all coffee lots from cooperative members
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5" />
          Export Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lots</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">124</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">42</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Listed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">35</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">38</p>
            </div>
            <Package className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">9</p>
            </div>
            <Package className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-5 w-5" />
          Filter
        </button>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option>All Status</option>
          <option>Available</option>
          <option>Listed</option>
          <option>Sold</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option>All Varieties</option>
          <option>Arabica SL28</option>
          <option>Ruiru 11</option>
          <option>Batian</option>
        </select>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trace ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variety
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harvest Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price ($)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/lot/${lot.traceId}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900"
                    >
                      {lot.traceId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.farmer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.variety}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(lot.harvestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${lot.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/lot/${lot.traceId}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900"
                    >
                      View
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Farmers</h2>
          <div className="space-y-3">
            {[
              { name: 'John Kamau', lots: 12, revenue: 5200 },
              { name: 'Mary Wanjiru', lots: 15, revenue: 6800 },
              { name: 'Peter Mwangi', lots: 8, revenue: 3400 },
            ].map((farmer, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{farmer.name}</p>
                  <p className="text-xs text-gray-600">{farmer.lots} lots</p>
                </div>
                <p className="text-sm font-bold text-green-600">${farmer.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variety Distribution</h2>
          <div className="space-y-4">
            {[
              { name: 'Arabica SL28', count: 52, percentage: 42 },
              { name: 'Ruiru 11', count: 38, percentage: 31 },
              { name: 'Batian', count: 34, percentage: 27 },
            ].map((variety) => (
              <div key={variety.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{variety.name}</span>
                  <span className="text-sm font-medium text-gray-900">{variety.count} lots</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${variety.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
