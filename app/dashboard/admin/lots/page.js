'use client';

import { Package, Filter, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminLotsPage() {
  const lots = [
    {
      id: 1,
      traceId: 'CT2024001',
      farmer: 'John Kamau',
      cooperative: 'Green Valley Coop',
      variety: 'Arabica SL28',
      weight: 500,
      status: 'listed',
      region: 'Kericho',
      price: 2100,
    },
    {
      id: 2,
      traceId: 'CT2024015',
      farmer: 'Mary Wanjiru',
      cooperative: 'Mountain Peak Coop',
      variety: 'Ruiru 11',
      weight: 300,
      status: 'sold',
      region: 'Nyeri',
      price: 1350,
    },
    {
      id: 3,
      traceId: 'CT2024008',
      farmer: 'Peter Mwangi',
      cooperative: 'Sunrise Estates',
      variety: 'Batian',
      weight: 450,
      status: 'available',
      region: 'Kiambu',
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
          <h1 className="text-2xl font-bold text-gray-900">All Coffee Lots</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor all coffee lots across the platform
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5" />
          Export All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lots</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,247</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">324</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Listed</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">428</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">445</p>
            </div>
            <Package className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">50</p>
            </div>
            <Package className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">$2.4M</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
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
          <option>All Regions</option>
          <option>Kericho</option>
          <option>Nyeri</option>
          <option>Kiambu</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option>All Cooperatives</option>
          <option>Green Valley Coop</option>
          <option>Mountain Peak Coop</option>
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
                  Cooperative
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variety
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
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
                    {lot.cooperative}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.variety}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lot.weight}
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

      {/* Regional Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h2>
          <div className="space-y-4">
            {[
              { region: 'Kericho County', lots: 425, percentage: 34 },
              { region: 'Nyeri County', lots: 352, percentage: 28 },
              { region: 'Kiambu County', lots: 298, percentage: 24 },
              { region: 'Embu County', lots: 172, percentage: 14 },
            ].map((data) => (
              <div key={data.region}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{data.region}</span>
                  <span className="text-sm font-medium text-gray-900">{data.lots} lots</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variety Breakdown</h2>
          <div className="space-y-4">
            {[
              { variety: 'Arabica SL28', count: 520, percentage: 42 },
              { variety: 'Ruiru 11', count: 399, percentage: 32 },
              { variety: 'Batian', count: 328, percentage: 26 },
            ].map((data) => (
              <div key={data.variety}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{data.variety}</span>
                  <span className="text-sm font-medium text-gray-900">{data.count} lots</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${data.percentage}%` }}
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
