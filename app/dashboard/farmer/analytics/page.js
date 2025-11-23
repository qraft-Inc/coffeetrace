'use client';

import { TrendingUp, DollarSign, Package, ShoppingBag, Scale, ArrowUp, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function FarmerAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics & Insights</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your farm's performance and trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              12.5%
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">$24,560</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              8.2%
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Lots Produced</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">45</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUp className="h-4 w-4" />
              15.3%
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Price/kg</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">$4.25</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
              <ArrowDown className="h-4 w-4" />
              3.1%
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Weight (kg)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">5,780</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        {/* Production Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Production Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Performance</h2>
          <div className="space-y-3">
            {['January', 'February', 'March', 'April', 'May'].map((month, idx) => (
              <div key={month} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {Math.floor(Math.random() * 10) + 5} lots
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ${(Math.random() * 5000 + 2000).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Varieties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performing Varieties</h2>
          <div className="space-y-4">
            {[
              { name: 'Arabica SL28', revenue: 12500, percentage: 45 },
              { name: 'Ruiru 11', revenue: 8200, percentage: 30 },
              { name: 'Batian', revenue: 3860, percentage: 25 },
            ].map((variety) => (
              <div key={variety.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{variety.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">${variety.revenue}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
                    style={{ width: `${variety.value}%` }}
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
