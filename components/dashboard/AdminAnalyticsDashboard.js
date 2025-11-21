'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Truck,
  Award,
  ShoppingCart,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`/api/admin/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type, format = 'csv') => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        ...dateRange,
        type,
        format,
      });
      
      const response = await fetch(`/api/admin/analytics/export?${params}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `coffeetrace-${type}-${Date.now()}.csv`;
          a.click();
        } else {
          const data = await response.json();
          console.log('Exported data:', data);
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-600">No analytics data available</div>;
  }

  const kpiCards = [
    {
      title: 'Total Lots',
      value: analytics.supplyChain.totalLots,
      change: '+12%',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `${(analytics.finance.totalRevenue / 1000000).toFixed(2)}M UGX`,
      change: '+23%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Farmers',
      value: analytics.farmers.activeFarmers,
      change: '+8%',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Quality Score',
      value: analytics.quality.avgQualityScore.toFixed(1),
      change: '+5%',
      icon: Award,
      color: 'bg-orange-500',
    },
    {
      title: 'Pending Pickups',
      value: analytics.supplyChain.pendingLots,
      change: '-15%',
      icon: Truck,
      color: 'bg-red-500',
    },
    {
      title: 'Total Orders',
      value: analytics.buyers.totalOrders,
      change: '+18%',
      icon: ShoppingCart,
      color: 'bg-indigo-500',
    },
    {
      title: 'Coffee Processed',
      value: `${(analytics.supplyChain.totalWeight / 1000).toFixed(1)}T`,
      change: '+25%',
      icon: BarChart3,
      color: 'bg-teal-500',
    },
    {
      title: 'Training Completion',
      value: `${analytics.training.avgCompletionRate.toFixed(0)}%`,
      change: '+10%',
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform performance metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => exportReport('summary', 'csv')}
          disabled={exporting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${kpi.color} text-white p-3 rounded-lg`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600">{kpi.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Grade Distribution</h3>
          <div className="space-y-3">
            {analytics.quality.gradeDistribution.map((grade, idx) => {
              const total = analytics.quality.gradeDistribution.reduce((sum, g) => sum + g.count, 0);
              const percentage = (grade.count / total) * 100;
              
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Grade {grade._id}</span>
                    <span className="text-gray-600">{grade.count} lots ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Defects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Defects</h3>
          <div className="space-y-3">
            {analytics.quality.defectAnalysis.slice(0, 5).map((defect, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {defect._id.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-900">{defect.count}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => exportReport('quality', 'csv')}
            className="mt-4 w-full py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Export Quality Report
          </button>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-gray-900">
                {(analytics.finance.totalRevenue / 1000000).toFixed(2)}M UGX
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-gray-600">Completed Payments</span>
              <span className="text-lg font-semibold text-green-600">
                {(analytics.finance.completedPayments / 1000000).toFixed(2)}M UGX
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Payments</span>
              <span className="text-lg font-semibold text-orange-600">
                {(analytics.finance.pendingPayments / 1000000).toFixed(2)}M UGX
              </span>
            </div>
          </div>
          <button
            onClick={() => exportReport('finance', 'csv')}
            className="mt-4 w-full py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Export Finance Report
          </button>
        </div>

        {/* Top Farmers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Farmers</h3>
          <div className="space-y-3">
            {analytics.farmers.topFarmers.slice(0, 5).map((farmer, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{farmer.name}</p>
                  <p className="text-xs text-gray-600">{farmer.lotCount} lots</p>
                </div>
                <span className="text-xs text-gray-500">
                  {farmer.lastLot ? new Date(farmer.lastLot).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => exportReport('farmers', 'csv')}
            className="mt-4 w-full py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Export Farmers Report
          </button>
        </div>

        {/* Logistics Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Status</h3>
          <div className="space-y-3">
            {analytics.logistics.pickupsByStatus.map((status, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{status._id}</span>
                <span className="text-sm font-semibold text-gray-900">{status.count}</span>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Avg Delivery Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  {analytics.logistics.avgDeliveryTime.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => exportReport('logistics', 'csv')}
            className="mt-4 w-full py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Export Logistics Report
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Selling Products</h3>
          <div className="space-y-3">
            {analytics.marketplace.topProducts.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">
                    {product.totalSales} sales • ★ {product.ratings?.average?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {product.price} UGX
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
