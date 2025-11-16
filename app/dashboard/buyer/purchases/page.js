'use client';

import { Package, Download, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function BuyerPurchasesPage() {
  const purchases = [
    {
      id: 1,
      lotId: 'CT2024015',
      farmer: 'Mountain Peak Coffee',
      variety: 'Ruiru 11',
      weight: 300,
      price: 1350,
      status: 'delivered',
      purchaseDate: '2024-11-12',
      deliveryDate: '2024-11-16',
    },
    {
      id: 2,
      lotId: 'CT2024009',
      farmer: 'Valley View Estates',
      variety: 'Arabica SL28',
      weight: 500,
      price: 2250,
      status: 'in-transit',
      purchaseDate: '2024-11-10',
      deliveryDate: '2024-11-18',
    },
    {
      id: 3,
      lotId: 'CT2024003',
      farmer: 'Sunrise Coffee Co.',
      variety: 'Batian',
      weight: 400,
      price: 1680,
      status: 'processing',
      purchaseDate: '2024-11-08',
      deliveryDate: '2024-11-20',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your coffee purchase history and track deliveries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Weight</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">6,850 kg</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$28,940</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Price/kg</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$4.22</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot ID
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
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/lot/${purchase.lotId}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900"
                    >
                      {purchase.lotId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.farmer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.variety}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${purchase.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                    <Link
                      href={`/lot/${purchase.lotId}`}
                      className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deliveries</h2>
        <div className="space-y-4">
          {purchases.filter(p => p.status !== 'delivered').map((purchase) => (
            <div key={purchase.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{purchase.lotId} - {purchase.variety}</p>
                <p className="text-xs text-gray-600 mt-1">Expected: {new Date(purchase.deliveryDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                {purchase.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
