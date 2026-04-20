'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Package, ShieldCheck, TrendingUp, AlertCircle, DollarSign, Gift,
  Activity, MapPin, Building2, Wallet, CreditCard, ShoppingBag, UserPlus,
  UserX, Clock, CheckCircle, XCircle, BarChart3,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
import VerificationQueue from '../../../components/dashboard/VerificationQueue';
import dynamicImport from 'next/dynamic';

const AllFarmsMap = dynamicImport(() => import('../../../components/map/AllFarmsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 rounded-lg animate-pulse"></div>
});

const ROLE_COLORS = {
  farmer: 'bg-green-100 text-green-800',
  buyer: 'bg-blue-100 text-blue-800',
  investor: 'bg-yellow-100 text-yellow-800',
  coopAdmin: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [overview, setOverview] = useState(null);
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
      const [analyticsRes, usersRes, farmersRes, financialRes, overviewRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/users?limit=1'),
        fetch('/api/farmers?limit=100'),
        fetch('/api/admin/financial-overview'),
        fetch('/api/admin/overview'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        const { analytics } = data;
        const usersData = usersRes.ok ? await usersRes.json() : {};
        setStats({
          totalUsers: usersData.total || 0,
          totalFarmers: analytics.farmers.activeFarmers || 0,
          totalBuyers: analytics.buyers.activeBuyers || 0,
          totalLots: analytics.supplyChain.totalLots || 0,
          totalTransactions: analytics.finance.totalTransactions || 0,
          pendingVerifications: analytics.supplyChain.pendingLots || 0,
        });
      } else {
        setStats({ totalUsers: 0, totalFarmers: 0, totalBuyers: 0, totalLots: 0, totalTransactions: 0, pendingVerifications: 0 });
      }

      if (farmersRes.ok) {
        const farmersData = await farmersRes.json();
        setAllFarmers(farmersData.farmers || []);
      }

      if (financialRes.ok) {
        const financialData = await financialRes.json();
        setFinancials(financialData.overview);
      }

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData.overview);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setStats({ totalUsers: 0, totalFarmers: 0, totalBuyers: 0, totalLots: 0, totalTransactions: 0, pendingVerifications: 0 });
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
            Welcome, {session?.user?.name || 'Admin'}
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

        {/* Operations Alerts Row */}
        {overview && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Pending Payouts */}
            <div className={`rounded-lg p-5 border-l-4 ${overview.payouts.pendingCount > 0 ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${overview.payouts.pendingCount > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-coffee-900">Pending Payouts</h3>
                </div>
                {overview.payouts.pendingCount > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                    Action needed
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-coffee-900">{overview.payouts.pendingCount}</p>
              <p className="text-sm text-coffee-600 mt-1">
                UGX {overview.payouts.pendingTotal.toLocaleString()} awaiting disbursement
              </p>
              <Link href="/dashboard/payouts" className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                View all payouts →
              </Link>
            </div>

            {/* Pending Loan Applications */}
            <div className={`rounded-lg p-5 border-l-4 ${overview.loans.pendingCount > 0 ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className={`h-5 w-5 ${overview.loans.pendingCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-coffee-900">Loan Applications</h3>
                </div>
                {overview.loans.pendingCount > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {overview.loans.pendingCount} pending
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-coffee-900">{overview.loans.pendingCount}</p>
              <p className="text-sm text-coffee-600 mt-1">
                UGX {overview.loans.pendingTotal.toLocaleString()} requested
              </p>
              <p className="text-xs text-coffee-500 mt-1">
                {overview.loans.activeCount} active · UGX {overview.loans.activeOutstanding.toLocaleString()} outstanding
              </p>
            </div>

            {/* Marketplace Health */}
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-coffee-900">Marketplace</h3>
              </div>
              <p className="text-3xl font-bold text-coffee-900">{overview.marketplace.activeListings}</p>
              <p className="text-sm text-coffee-600 mt-1">Active listings</p>
              <p className="text-xs text-coffee-500 mt-1">
                {overview.marketplace.recentOrders} orders in the last 30 days
              </p>
              <Link href="/marketplace" className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                Go to marketplace →
              </Link>
            </div>
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

        {/* Wallet Balances + Cooperatives side by side */}
        {overview && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Platform Wallet Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Wallet className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-coffee-900">Platform Wallets</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-coffee-100">
                  <span className="text-coffee-600 text-sm">Total Balance (all wallets)</span>
                  <span className="font-bold text-coffee-900">UGX {overview.wallets.totalBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-coffee-100">
                  <span className="text-coffee-600 text-sm">Available Balance</span>
                  <span className="font-semibold text-green-600">UGX {overview.wallets.totalAvailable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-coffee-100">
                  <span className="text-coffee-600 text-sm">Locked / Escrowed</span>
                  <span className="font-semibold text-orange-600">UGX {overview.wallets.totalLocked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-coffee-600 text-sm">Active Wallets</span>
                  <span className="font-semibold text-coffee-900">{overview.wallets.walletCount}</span>
                </div>
              </div>
            </div>

            {/* Cooperatives */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-coffee-900">Cooperatives</h2>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-coffee-600">{overview.cooperatives.active} active</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-coffee-600">{overview.cooperatives.inactive} inactive</span>
                  </span>
                </div>
              </div>
              <p className="text-sm text-coffee-500 mb-3">Top cooperatives by farmer count</p>
              <div className="space-y-2">
                {overview.cooperatives.topByMembers.length === 0 ? (
                  <p className="text-coffee-500 text-sm text-center py-4">No cooperatives found</p>
                ) : (
                  overview.cooperatives.topByMembers.map((coop, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-coffee-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-coffee-400 w-4">{i + 1}.</span>
                        <span className="text-sm font-medium text-coffee-900">{coop.name}</span>
                        {!coop.isActive && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">inactive</span>
                        )}
                      </div>
                      <span className="text-sm text-coffee-600">{coop.farmerCount} farmers</span>
                    </div>
                  ))
                )}
              </div>
              <Link href="/dashboard/admin/users?role=coopAdmin" className="text-xs text-primary-600 hover:underline mt-3 inline-block">
                View all cooperatives →
              </Link>
            </div>
          </div>
        )}

        {/* New Registrations + Role Breakdown side by side */}
        {overview && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* New Registrations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-coffee-900">New Registrations</h2>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{overview.registrations.thisWeek}</p>
                    <p className="text-coffee-500 text-xs">This week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-coffee-700">{overview.registrations.thisMonth}</p>
                    <p className="text-coffee-500 text-xs">This month</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {overview.registrations.recent.length === 0 ? (
                  <p className="text-coffee-500 text-sm text-center py-4">No new registrations this week</p>
                ) : (
                  overview.registrations.recent.map((user) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-coffee-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-coffee-900">{user.name}</p>
                        <p className="text-xs text-coffee-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                        {!user.isActive && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">inactive</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/dashboard/admin/users" className="text-xs text-primary-600 hover:underline mt-3 inline-block">
                Manage all users →
              </Link>
            </div>

            {/* Role Breakdown + Inactive Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-coffee-900">User Distribution</h2>
              </div>
              <div className="space-y-3 mb-6">
                {overview.roleBreakdown.map((item) => {
                  const total = overview.roleBreakdown.reduce((s, r) => s + r.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.role}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`px-2 py-0.5 rounded font-medium text-xs ${ROLE_COLORS[item.role] || 'bg-gray-100 text-gray-700'}`}>
                          {item.role}
                        </span>
                        <span className="text-coffee-600 font-semibold">{item.count} <span className="text-coffee-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-coffee-100 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <UserX className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  <span className="font-bold">{overview.inactiveUsers}</span> users inactive for 30+ days
                </p>
                <Link href="/dashboard/admin/users" className="ml-auto text-xs text-red-600 hover:underline whitespace-nowrap">
                  Review →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Admin Tools</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Users className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">User Management</span>
            </Link>
            <Link
              href="/dashboard/admin/investors"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">All Investors</span>
            </Link>
            <Link
              href="/dashboard/admin/verification"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ShieldCheck className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Verify Farmers</span>
            </Link>
            <Link
              href="/dashboard/admin/analytics"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Platform Analytics</span>
            </Link>
            <Link
              href="/dashboard/admin/farmers"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Farmers</span>
            </Link>
          </div>
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
