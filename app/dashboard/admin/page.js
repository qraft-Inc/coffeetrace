'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
import VerificationQueue from '../../../components/dashboard/VerificationQueue';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch platform-wide stats
      // In production, you'd have /api/admin/stats endpoint
      setStats({
        totalUsers: 0,
        totalFarmers: 0,
        totalBuyers: 0,
        totalLots: 0,
        totalTransactions: 0,
        pendingVerifications: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader session={session} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            System Admin Console
          </h1>
          <p className="text-coffee-600">Platform Management Dashboard</p>
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

        {/* Document Verification Queue */}
        <VerificationQueue />
      </div>
      </div>
    </RequireAuth>
  );
}
