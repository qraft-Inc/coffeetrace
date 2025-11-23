'use client';

import { BarChart3, Download, TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function CoopReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive insights for your cooperative
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600">+12.5%</span>
          </div>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$124,560</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600">+8.2%</span>
          </div>
          <p className="text-sm text-gray-600">Total Lots</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">124</p>
          <p className="text-xs text-gray-500 mt-1">This year</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600">+3</span>
          </div>
          <p className="text-sm text-gray-600">Active Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
          <p className="text-xs text-gray-500 mt-1">Total farmers</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600">+15.3%</span>
          </div>
          <p className="text-sm text-gray-600">Avg Price/kg</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$4.18</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Volume</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <div className="space-y-3">
            {[
              { month: 'November', lots: 18, revenue: 24500, members: 15 },
              { month: 'October', lots: 22, revenue: 28300, members: 18 },
              { month: 'September', lots: 20, revenue: 26100, members: 16 },
              { month: 'August', lots: 16, revenue: 21800, members: 14 },
            ].map((data) => (
              <div key={data.month} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{data.month}</p>
                  <p className="text-xs text-gray-600">{data.members} active members</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${data.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{data.lots} lots</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Contributions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
          <div className="space-y-4">
            {[
              { name: 'John Kamau', contribution: 42, revenue: 18200 },
              { name: 'Mary Wanjiru', contribution: 38, revenue: 16500 },
              { name: 'Peter Mwangi', contribution: 28, revenue: 12100 },
              { name: 'Jane Njeri', contribution: 24, revenue: 10400 },
            ].map((member, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  <span className="text-sm text-green-600">${member.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${member.contribution}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{member.contribution}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality & Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">85%</p>
            <p className="text-sm text-gray-700 mt-2">Organic Certified</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">92%</p>
            <p className="text-sm text-gray-700 mt-2">Fair Trade</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">4.6/5</p>
            <p className="text-sm text-gray-700 mt-2">Average Quality Score</p>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
