'use client';

export const dynamic = 'force-dynamic';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, ShoppingCart, Package, DollarSign, Leaf, LogOut } from 'lucide-react';
import { formatWeight, formatDate, formatCurrency, formatCarbon } from '../../../lib/formatters';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-coffee-600" />
              <span className="text-2xl font-bold text-coffee-800">Coffee Trace</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/marketplace" className="text-coffee-700 hover:text-coffee-900">
                Marketplace
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-coffee-700 hover:text-coffee-900"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-coffee-600">Buyer Dashboard</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<ShoppingCart />}
              label="Total Purchases"
              value={`${stats.totalPurchases} lots`}
              color="blue"
            />
            <StatCard
              icon={<DollarSign />}
              label="Total Spent"
              value={formatCurrency(stats.totalSpent)}
              color="green"
            />
            <StatCard
              icon={<Package />}
              label="Pending Offers"
              value={stats.pendingOffers}
              color="yellow"
            />
            <StatCard
              icon={<Leaf />}
              label="Carbon Impact"
              value={formatCarbon(stats.carbonSaved)}
              color="green"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Browse Marketplace</span>
            </Link>
            <Link
              href="/dashboard/buyer/offers"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">My Offers</span>
            </Link>
            <Link
              href="/dashboard/buyer/purchases"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Coffee className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Purchase History</span>
            </Link>
          </div>
        </div>

        {/* Active Offers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Active Offers</h2>
          
          {loading ? (
            <p className="text-coffee-600">Loading offers...</p>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600 mb-4">You haven't made any offers yet.</p>
              <Link
                href="/marketplace"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer._id} className="border border-coffee-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-coffee-900">
                        {offer.listing?.lot?.variety} Coffee
                      </h3>
                      <p className="text-sm text-coffee-600">
                        {formatWeight(offer.amountKg)} @ {formatCurrency(offer.pricePerKg)}/kg
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getOfferStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Recent Purchases</h2>
          
          {transactions.length === 0 ? (
            <p className="text-coffee-600">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="border border-coffee-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-coffee-900">
                        {formatWeight(tx.amountKg)} of {tx.lot?.variety}
                      </h3>
                      <p className="text-sm text-coffee-600">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-900">
                        {formatCurrency(tx.totalAmount, tx.currency)}
                      </p>
                      <span className={`text-sm ${getPaymentStatusColor(tx.paymentStatus)}`}>
                        {tx.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-coffee-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-coffee-900">{value}</p>
    </div>
  );
}

function getOfferStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    countered: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
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
