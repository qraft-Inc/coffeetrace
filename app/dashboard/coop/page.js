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
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    totalFinancePartners: 0,
    totalLots: 0,
    activeLots: 0,
    soldLots: 0,
    exportedLots: 0,
    deliveredLots: 0,
    totalHarvest: 0,
    avgQuality: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (session?.user?.cooperativeId) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const cooperativeId = session?.user?.cooperativeId;
      const query = cooperativeId ? `?cooperativeId=${cooperativeId}&limit=1` : '?limit=1';

      const [
        farmersRes,
        buyersRes,
        partnersRes,
        lotsRes,
        soldLotsRes,
        exportedLotsRes,
        deliveredLotsRes,
      ] = await Promise.allSettled([
        fetch(`/api/farmers${query}`),
        fetch(`/api/buyers${query}`),
        fetch(`/api/finance-partners${query}`),
        fetch(`/api/lots${query}`),
        fetch(`/api/lots${query}&status=sold`),
        fetch(`/api/lots${query}&status=exported`),
        fetch(`/api/lots${query}&status=delivered`),
      ]);

      const readTotal = async (result, path = ['pagination', 'total']) => {
        if (result.status !== 'fulfilled' || !result.value?.ok) return 0;
        const data = await result.value.json();
        return path.reduce((acc, key) => (acc ? acc[key] : undefined), data) || 0;
      };

      const [
        totalFarmers,
        totalBuyers,
        totalFinancePartners,
        totalLots,
        soldLots,
        exportedLots,
        deliveredLots,
      ] = await Promise.all([
        readTotal(farmersRes),
        readTotal(buyersRes),
        readTotal(partnersRes),
        readTotal(lotsRes),
        readTotal(soldLotsRes),
        readTotal(exportedLotsRes),
        readTotal(deliveredLotsRes),
      ]);

      const closedLots = soldLots + exportedLots + deliveredLots;
      const activeLots = Math.max(totalLots - closedLots, 0);

      setStats({
        totalFarmers,
        totalBuyers,
        totalFinancePartners,
        totalLots,
        activeLots,
        soldLots,
        exportedLots,
        deliveredLots,
        totalHarvest: 0,
        avgQuality: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

        {/* Farmers, Buyers, Finance, and Lots Overview */}
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-coffee-900 mb-3 sm:mb-4">Farmers, Buyers, Finance Partners, and Lots</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
              <div className="border border-coffee-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-coffee-600">Farmers</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.totalFarmers}</p>
              </div>
              <div className="border border-orange-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-orange-700">Buyers</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.totalBuyers}</p>
              </div>
              <div className="border border-emerald-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Finance Partners</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.totalFinancePartners}</p>
              </div>
              <div className="border border-green-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-green-700">All Lots</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.totalLots}</p>
              </div>
              <div className="border border-lime-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-lime-700">Active Lots</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.activeLots}</p>
              </div>
              <div className="border border-amber-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-amber-700">Sold</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.soldLots}</p>
              </div>
              <div className="border border-sky-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-sky-700">Exported</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.exportedLots}</p>
              </div>
              <div className="border border-violet-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-violet-700">Delivered</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">{stats.deliveredLots}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/coop/farmers"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View Farmers
              </Link>
              <Link
                href="/dashboard/coop/buyers"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                View Buyers
              </Link>
              <Link
                href="/dashboard/coop/finance"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                View Finance Partners
              </Link>
              <Link
                href="/dashboard/coop/lots"
                className="inline-flex items-center px-4 py-2 bg-coffee-800 text-white rounded-lg hover:bg-coffee-900"
              >
                View All Lots
              </Link>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
