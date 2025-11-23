'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Plus, Package, TrendingUp, MapPin, Calendar, Award } from 'lucide-react';
import { formatWeight, formatDate } from '../../../lib/formatters';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';

export default function FarmerDashboard() {
  const { data: session } = useSession();
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.farmerProfile) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch farmer's lots
      const lotsRes = await fetch(`/api/lots?farmerId=${session.user.farmerProfile}`);
      const lotsData = await lotsRes.json();
      setLots(lotsData.lots || []);

      // Calculate stats
      const totalQuantity = lotsData.lots?.reduce((sum, lot) => sum + lot.quantityKg, 0) || 0;
      const avgQuality = lotsData.lots?.length > 0
        ? lotsData.lots.reduce((sum, lot) => sum + (lot.qualityScore || 0), 0) / lotsData.lots.length
        : 0;

      setStats({
        totalLots: lotsData.lots?.length || 0,
        totalQuantity,
        avgQuality: avgQuality.toFixed(1),
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your farm today</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Total Coffee Lots"
              value={stats.totalLots}
              trend={11.01}
              trendLabel="vs last month"
              color="primary"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Total Harvest"
              value={formatWeight(stats.totalQuantity)}
              trend={-9.05}
              trendLabel="vs last month"
              color="coffee"
            />
            <StatCard
              icon={<Award className="h-6 w-6" />}
              label="Avg Quality Score"
              value={`${stats.avgQuality}/100`}
              trend={5.2}
              trendLabel="vs last month"
              color="green"
            />
            <StatCard
              icon={<MapPin className="h-6 w-6" />}
              label="Active Listings"
              value={lots.filter(l => l.status === 'listed').length}
              color="blue"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/farmer/lots/new"
              className="group flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Create New Lot</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Register new harvest</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/farmer/profile"
              className="group flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-coffee-100 dark:bg-coffee-900/30 text-coffee-600 dark:text-coffee-400 rounded-lg group-hover:bg-coffee-600 group-hover:text-white transition-colors">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Update Farm Info</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Edit your profile</p>
              </div>
            </Link>
            
            <Link
              href="/marketplace"
              className="group flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Browse Marketplace</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Explore opportunities</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Lots */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Coffee Lots</h2>
            <Link
              href="/dashboard/farmer/lots"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View All
            </Link>
          </div>
          
          {lots.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No lots yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start by creating your first coffee lot</p>
              <Link
                href="/dashboard/farmer/lots/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Your First Lot
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Trace ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Variety</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Quantity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Harvest Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {lots.slice(0, 5).map((lot) => (
                    <tr key={lot._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 px-4">
                        <code className="text-sm font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                          {lot.traceId.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{lot.variety}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-gray-100">{formatWeight(lot.quantityKg)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(lot.harvestDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                          {lot.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/lot/${lot.traceId}`}
                          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function getStatusColor(status) {
  const colors = {
    harvested: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    processed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    stored: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    listed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    sold: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
  };
  return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
}
