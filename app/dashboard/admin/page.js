'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, ShieldCheck, TrendingUp, AlertCircle, DollarSign, Gift, Activity, MapPin } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
import VerificationQueue from '../../../components/dashboard/VerificationQueue';
import dynamicImport from 'next/dynamic';

const AllFarmsMap = dynamicImport(() => import('../../../components/map/AllFarmsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 rounded-lg animate-pulse"></div>
});

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allFarmers, setAllFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch platform-wide stats from analytics API
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      const { analytics } = data;
      
      // Count total users
      const usersResponse = await fetch('/api/admin/users?limit=1');
      const usersData = await usersResponse.json();
      
      setStats({
        totalUsers: usersData.total || 0,
        totalFarmers: analytics.farmers.activeFarmers || 0,
        totalBuyers: analytics.buyers.activeBuyers || 0,
        totalLots: analytics.supplyChain.totalLots || 0,
        totalTransactions: analytics.finance.totalTransactions || 0,
        pendingVerifications: analytics.supplyChain.pendingLots || 0,
      });

      // Fetch all farmers for map
      const farmersResponse = await fetch('/api/farmers?limit=100');
      if (farmersResponse.ok) {
        const farmersData = await farmersResponse.json();
        setAllFarmers(farmersData.farmers || []);
      }

      // Fetch financial overview
      const financialResponse = await fetch('/api/admin/financial-overview');
      if (financialResponse.ok) {
        const financialData = await financialResponse.json();
        setFinancials(financialData.overview);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set fallback data
      setStats({
        totalUsers: 0,
        totalFarmers: 0,
        totalBuyers: 0,
        totalLots: 0,
        totalTransactions: 0,
        pendingVerifications: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth requiredRole="admin">
      <DashboardLayout title="Admin Dashboard">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Admin
          </h1>
          <p className="text-gray-600">Platform Management Dashboard</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-6 gap-6 mb-8">
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Total Users"
              value={stats.totalUsers}
              color="blue"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Farmers"
              value={stats.totalFarmers}
              color="green"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Buyers"
              value={stats.totalBuyers}
              color="purple"
            />
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Coffee Lots"
              value={stats.totalLots}
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Transactions"
              value={stats.totalTransactions}
              color="green"
            />
            <StatCard
              icon={<AlertCircle className="h-6 w-6" />}
              label="Pending Reviews"
              value={stats.pendingVerifications}
              color="red"
            />
          </div>
        )}

        {/* Financial Overview */}
        {financials && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-6">Financial Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-coffee-900">Total Sales Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">RWF {financials.totalSalesRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-coffee-600 mt-1">From all farmer sales</p>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-coffee-900">Total Tips</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">RWF {financials.totalTips?.toLocaleString() || 0}</p>
                <p className="text-sm text-coffee-600 mt-1">From buyer appreciation</p>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-coffee-900">Total Transactions</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">{financials.totalTransactions?.toLocaleString() || 0}</p>
                <p className="text-sm text-coffee-600 mt-1">By all users</p>
              </div>

              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-coffee-900">Platform Fees</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600">RWF {financials.totalPlatformFees?.toLocaleString() || 0}</p>
                <p className="text-sm text-coffee-600 mt-1">3% on tips</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Admin Tools</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Users className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">User Management</span>
            </Link>
            <Link
              href="/dashboard/admin/verification"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ShieldCheck className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Verify Farmers</span>
            </Link>
            <Link
              href="/dashboard/admin/lots"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Manage Lots</span>
            </Link>
            <Link
              href="/dashboard/admin/reports"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Platform Analytics</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Recent Platform Activity</h2>
          
          {loading ? (
            <p className="text-coffee-600">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600">No recent activity to display.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-coffee-100 pb-3">
                  <div>
                    <p className="text-coffee-900">{activity.description}</p>
                    <p className="text-sm text-coffee-600">{activity.timestamp}</p>
                  </div>
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Farm Traceability Map */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary-600" />
            Farm Traceability Map
          </h2>
          <p className="text-sm text-coffee-600 mb-4">
            Geographic visualization of all registered farms with boundary polygons for complete traceability
          </p>
          <AllFarmsMap farmers={allFarmers} height="500px" />
        </div>

        {/* Document Verification Queue */}
        <VerificationQueue />
      </DashboardLayout>
    </RequireAuth>
  );
}
