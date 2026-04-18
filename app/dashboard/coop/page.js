'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, TrendingUp, MapPin, DollarSign, ShoppingCart, PiggyBank } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
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
    <RequireAuth requiredRole="coopAdmin">
      <DashboardLayout title="Cooperative Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Welcome */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-coffee-900">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-sm sm:text-base text-coffee-600">Manage your cooperative and support your farmers</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-coffee-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard/coop/farmers"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Users className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Manage Farmers</span>
            </Link>
            <Link
              href="/dashboard/coop/buyers"
              className="flex items-center gap-3 p-4 border-2 border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <span className="font-semibold text-coffee-900">Manage Buyers</span>
            </Link>
            <Link
              href="/dashboard/coop/finance"
              className="flex items-center gap-3 p-4 border-2 border-emerald-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              <PiggyBank className="h-6 w-6 text-emerald-600" />
              <span className="font-semibold text-coffee-900">Finance Partners</span>
            </Link>
            <Link
              href="/dashboard/cooperative/agro-inputs"
              className="flex items-center gap-3 p-4 border-2 border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Package className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-coffee-900">Agro-Inputs</span>
            </Link>
            <Link
              href="/dashboard/coop/farm-identity"
              className="flex items-center gap-3 p-4 border-2 border-lime-300 rounded-lg hover:border-lime-500 hover:bg-lime-50 transition-colors"
            >
              <MapPin className="h-6 w-6 text-lime-700" />
              <span className="font-semibold text-coffee-900">Farm Identity</span>
            </Link>
            <Link
              href="/dashboard/coop/lots"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">View All Lots</span>
            </Link>
          </div>
        </div>

        {/* Member Farmers */}
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-coffee-900 mb-3 sm:mb-4">Member Farmers</h2>
          
          {loading ? (
            <p className="text-sm sm:text-base text-coffee-600">Loading farmers...</p>
          ) : farmers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600 mb-4">No registered farmers yet.</p>
              <Link
                href="/dashboard/coop/farmers/invite"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Invite Farmers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {farmers.map((farmer) => (
                <div key={farmer._id} className="border border-coffee-200 rounded-lg p-4">
                  <h3 className="font-semibold text-coffee-900">{farmer.farmerName}</h3>
                  <p className="text-sm text-coffee-600">{farmer.location?.district}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-coffee-600">Lots: {farmer.totalLots || 0}</span>
                    <span className="text-coffee-600">
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
    </RequireAuth>
  );
}
