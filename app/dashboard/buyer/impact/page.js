'use client';

import { Leaf, Users, TrendingUp, Award, MapPin, Download } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function BuyerImpactPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Report</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your contribution to sustainable coffee farming
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5" />
          Download Report
        </button>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-800">Farmers Supported</p>
          <p className="text-3xl font-bold text-green-900 mt-1">24</p>
          <p className="text-xs text-green-700 mt-2">Across 5 regions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-800">Lives Impacted</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">156</p>
          <p className="text-xs text-blue-700 mt-2">Family members</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-800">Fair Trade Premium</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">$4,520</p>
          <p className="text-xs text-purple-700 mt-2">Paid above market</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-800">Certified Lots</p>
          <p className="text-3xl font-bold text-orange-900 mt-1">16</p>
          <p className="text-xs text-orange-700 mt-2">Organic & Fair Trade</p>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2,340 kg</p>
            <p className="text-sm text-gray-600 mt-1">CO2 Offset</p>
            <p className="text-xs text-gray-500 mt-2">Through sustainable practices</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12.5 ha</p>
            <p className="text-sm text-gray-600 mt-1">Land Protected</p>
            <p className="text-xs text-gray-500 mt-2">Organic farming areas</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">850 trees</p>
            <p className="text-sm text-gray-600 mt-1">Trees Planted</p>
            <p className="text-xs text-gray-500 mt-2">Shade-grown initiatives</p>
          </div>
        </div>
      </div>

      {/* Regional Impact Map */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional Impact</h2>
        <div className="space-y-4">
          {[
            { region: 'Kericho County', farmers: 8, lots: 24, amount: 12500 },
            { region: 'Nyeri County', farmers: 6, lots: 18, amount: 9200 },
            { region: 'Kiambu County', farmers: 5, lots: 15, amount: 8400 },
            { region: 'Embu County', farmers: 5, lots: 14, amount: 7100 },
          ].map((region, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{region.region}</p>
                  <p className="text-xs text-gray-600">{region.farmers} farmers · {region.lots} lots purchased</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">${region.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Total investment</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Programs</h2>
          <div className="space-y-3">
            {[
              { name: 'Education Support', value: '32 children', percentage: 85 },
              { name: 'Healthcare Access', value: '18 families', percentage: 70 },
              { name: 'Clean Water', value: '12 projects', percentage: 60 },
            ].map((program) => (
              <div key={program.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{program.name}</span>
                  <span className="text-sm font-medium text-gray-900">{program.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${program.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality & Certifications</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Organic Certified</span>
              </div>
              <span className="text-sm text-green-700">67%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Fair Trade</span>
              </div>
              <span className="text-sm text-blue-700">89%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Rainforest Alliance</span>
              </div>
              <span className="text-sm text-purple-700">45%</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
