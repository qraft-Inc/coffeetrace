'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Coffee, Calendar } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalLots: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    averagePrice: 0,
    topCoffeeTypes: [],
    revenueByMonth: []
  });

  return (
    <RequireAuth allowedRoles={['admin']}>
      <DashboardLayout title="Analytics & Reports">
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$0</p>
                  <p className="text-xs text-green-600 mt-1">+0% from last period</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lots</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-blue-600 mt-1">+0% from last period</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-purple-600 mt-1">+0% from last period</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Buyers</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-orange-600 mt-1">+0% from last period</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Revenue chart will display here</p>
                </div>
              </div>
            </div>

            {/* Top Coffee Types */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Coffee Varieties</h3>
              <div className="space-y-3">
                {['Arabica', 'Robusta', 'Bourbon', 'Typica', 'Geisha'].map((type, index) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5 text-coffee-600" />
                      <span className="text-sm font-medium text-gray-900">{type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600"
                          style={{ width: `${(5 - index) * 20}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {(5 - index) * 20}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { action: 'New farmer registered', time: '2 hours ago', icon: Users, color: 'blue' },
                { action: 'Lot verified and listed', time: '5 hours ago', icon: Package, color: 'green' },
                { action: 'Purchase completed', time: '1 day ago', icon: DollarSign, color: 'purple' },
                { action: 'Quality inspection completed', time: '2 days ago', icon: Coffee, color: 'orange' }
              ].map((activity, index) => (
                <div key={index} className="px-6 py-4 flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                    <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                Export as CSV
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                Export as PDF
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
