'use client';

import { TrendingUp, DollarSign, Users, Package, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive insights across the entire platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              18.5%
            </div>
          </div>
          <p className="text-sm text-gray-600">Total Platform Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$2.4M</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              12.3%
            </div>
          </div>
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">248</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              8.7%
            </div>
          </div>
          <p className="text-sm text-gray-600">Total Lots</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,247</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
              <ArrowDown className="h-4 w-4" />
              2.1%
            </div>
          </div>
          <p className="text-sm text-gray-600">Avg Transaction Size</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$1,950</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-3">
            {[
              { role: 'Farmers', count: 185, percentage: 75, color: 'bg-green-600' },
              { role: 'Buyers', count: 45, percentage: 18, color: 'bg-blue-600' },
              { role: 'Coop Admins', count: 15, percentage: 6, color: 'bg-purple-600' },
              { role: 'Admins', count: 3, percentage: 1, color: 'bg-red-600' },
            ].map((item) => (
              <div key={item.role}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.role}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h2>
          <div className="space-y-3">
            {[
              { status: 'Completed', count: 445, percentage: 70, color: 'bg-green-600' },
              { status: 'In Progress', count: 152, percentage: 24, color: 'bg-blue-600' },
              { status: 'Pending', count: 38, percentage: 6, color: 'bg-yellow-600' },
            ].map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">API Response Time</span>
              <span className="text-sm font-bold text-green-600">124ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Database Load</span>
              <span className="text-sm font-bold text-blue-600">32%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Uptime</span>
              <span className="text-sm font-bold text-purple-600">99.98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Cooperatives</h2>
          <div className="space-y-3">
            {[
              { name: 'Green Valley Coop', members: 48, revenue: 124560 },
              { name: 'Mountain Peak Coop', members: 42, revenue: 98200 },
              { name: 'Sunrise Estates Coop', members: 35, revenue: 82400 },
              { name: 'Highland Coffee Coop', members: 28, revenue: 65100 },
            ].map((coop, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{coop.name}</p>
                  <p className="text-xs text-gray-600">{coop.members} members</p>
                </div>
                <p className="text-sm font-bold text-green-600">${(coop.revenue / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Buyers</h2>
          <div className="space-y-3">
            {[
              { name: 'Global Coffee Co.', purchases: 85, amount: 352000 },
              { name: 'Premium Roasters Ltd', purchases: 72, amount: 298500 },
              { name: 'Artisan Coffee House', purchases: 64, amount: 264200 },
              { name: 'Quality Beans Inc', purchases: 58, amount: 240100 },
            ].map((buyer, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{buyer.name}</p>
                  <p className="text-xs text-gray-600">{buyer.purchases} purchases</p>
                </div>
                <p className="text-sm font-bold text-blue-600">${(buyer.amount / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
