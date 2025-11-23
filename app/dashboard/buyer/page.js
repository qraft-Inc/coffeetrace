'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, ShoppingCart, Package, DollarSign, Leaf } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { formatWeight, formatDate, formatCurrency, formatCarbon } from '../../../lib/formatters';

export default function BuyerDashboard() {
  const { data: session } = useSession();
  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [farmers, setFarmers] = useState([]);
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

      // Fetch featured farmers
      const farmersResponse = await fetch('/api/farmers?limit=6');
      if (farmersResponse.ok) {
        const farmersData = await farmersResponse.json();
        setFarmers(farmersData.farmers || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Buyer Dashboard">
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

        {/* Meet Our Farmers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-coffee-900">Meet Our Farmers</h2>
            <Link
              href="/dashboard/buyer/farmers"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : farmers.length === 0 ? (
            <p className="text-coffee-600 text-center py-8">No farmers available yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {farmers.map((farmer) => (
                <Link
                  key={farmer._id}
                  href={`/dashboard/buyer/farmers/${farmer._id}`}
                  className="group border border-coffee-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-primary-400 transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
                    {farmer.profilePhotoUrl ? (
                      <img
                        src={farmer.profilePhotoUrl}
                        alt={farmer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee className="h-16 w-16 text-green-600 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{farmer.name}</h3>
                      {farmer.location?.district && (
                        <p className="text-white/90 text-sm flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          {farmer.location.district}, {farmer.location.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-coffee-600 mb-2">
                      {farmer.farmSize && (
                        <span className="flex items-center gap-1">
                          <Leaf className="h-4 w-4" />
                          {farmer.farmSize} {farmer.farmSizeUnit || 'hectares'}
                        </span>
                      )}
                    </div>
                    {farmer.primaryVariety && (
                      <p className="text-sm text-coffee-600 mb-2">
                        Grows: <span className="font-medium text-coffee-900">{farmer.primaryVariety}</span>
                      </p>
                    )}
                    {farmer.certifications && farmer.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {farmer.certifications.slice(0, 2).map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                          >
                            {typeof cert === 'string' ? cert : cert.name || 'Certified'}
                          </span>
                        ))}
                        {farmer.certifications.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{farmer.certifications.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 text-primary-600 group-hover:text-primary-700 text-sm font-medium">
                      Read Their Story →
                    </div>
                  </div>
                </Link>
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
    </DashboardLayout>
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
