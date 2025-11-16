'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { formatWeight, formatCurrency } from '../../../lib/formatters';

export default function CoopDashboard() {
  const { data: session } = useSession();
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.cooperativeId) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch cooperative farmers and stats
      // In production, you'd have /api/cooperatives/[id]/farmers endpoint
      setStats({
        totalFarmers: 0,
        totalHarvest: 0,
        avgQuality: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Cooperative Admin Dashboard</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Total Farmers"
              value={stats.totalFarmers}
              color="blue"
            />
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Total Harvest"
              value={formatWeight(stats.totalHarvest)}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Avg Quality Score"
              value={`${stats.avgQuality}/100`}
              color="yellow"
            />
            <StatCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              color="green"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/coop/farmers"
              className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Manage Farmers</span>
            </Link>
            <Link
              href="/dashboard/coop/lots"
              className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">View All Lots</span>
            </Link>
            <Link
              href="/dashboard/coop/reports"
              className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Generate Reports</span>
            </Link>
          </div>
        </div>

        {/* Member Farmers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Member Farmers</h2>
          
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading farmers...</p>
          ) : farmers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No registered farmers yet.</p>
              <Link
                href="/dashboard/coop/farmers/invite"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Invite Farmers
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmers.map((farmer) => (
                <div key={farmer._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{farmer.farmerName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{farmer.location?.district}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Lots: {farmer.totalLots || 0}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatWeight(farmer.totalYield || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
