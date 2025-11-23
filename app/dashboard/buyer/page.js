'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, ShoppingCart, Package, DollarSign, Leaf, TrendingUp } from 'lucide-react';
import { formatWeight, formatDate, formatCurrency, formatCarbon } from '../../../lib/formatters';
import StatCard from '../../../components/dashboard/StatCard';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // In a real implementation, you'd have endpoints for buyer-specific data
      // For now, we'll use mock data
      setStats({
        totalPurchases: 0,
        totalSpent: 0,
        pendingOffers: 0,
        carbonSaved: 0,
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
          <p className="text-gray-600 dark:text-gray-400">Track your purchases and manage offers</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<ShoppingCart className="h-6 w-6" />}
              label="Total Purchases"
              value={`${stats.totalPurchases} lots`}
              trend={11.01}
              trendLabel="vs last month"
              color="blue"
            />
            <StatCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Total Spent"
              value={formatCurrency(stats.totalSpent)}
              trend={-9.05}
              trendLabel="vs last month"
              color="green"
            />
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Pending Offers"
              value={stats.pendingOffers}
              color="orange"
            />
            <StatCard
              icon={<Leaf className="h-6 w-6" />}
              label="Carbon Impact"
              value={formatCarbon(stats.carbonSaved)}
              trend={10}
              trendLabel="positive impact"
              color="primary"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/marketplace"
              className="group flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Browse Marketplace</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find quality coffee</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/buyer/offers"
              className="group flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-coffee-100 dark:bg-coffee-900/30 text-coffee-600 dark:text-coffee-400 rounded-lg group-hover:bg-coffee-600 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">My Offers</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track negotiations</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/buyer/purchases"
              className="group flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Purchase History</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">View past orders</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Active Offers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Offers</h2>
            <Link
              href="/dashboard/buyer/offers"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View All
            </Link>
          </div>
          
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No active offers</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Browse the marketplace to make your first offer</p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {offer.listing?.lot?.variety} Coffee
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatWeight(offer.amountKg)} @ {formatCurrency(offer.pricePerKg)}/kg
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOfferStatusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Purchases</h2>
            <Link
              href="/dashboard/buyer/purchases"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View All
            </Link>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <Coffee className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No purchases yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Your purchase history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatWeight(tx.amountKg)} of {tx.lot?.variety}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(tx.totalAmount, tx.currency)}
                    </p>
                    <span className={`text-sm font-medium ${getPaymentStatusColor(tx.paymentStatus)}`}>
                      {tx.paymentStatus}
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

function getOfferStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    accepted: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    countered: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  };
  return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
}

function getPaymentStatusColor(status) {
  const colors = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
}
