'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Plus, Package, TrendingUp, MapPin, DollarSign, Gift } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { formatWeight, formatDate, formatCurrency } from '../../../lib/formatters';

export default function FarmerDashboard() {
  const { data: session } = useSession();
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
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

      // Fetch earnings data
      if (session.user.farmerProfile) {
        const earningsRes = await fetch(`/api/farmers/${session.user.farmerProfile}/earnings`);
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings(earningsData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Farmer Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-coffee-600">Farmer Dashboard</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <StatCard
              icon={<Package />}
              label="Total Lots"
              value={stats.totalLots}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp />}
              label="Total Harvest"
              value={formatWeight(stats.totalQuantity)}
              color="green"
            />
            <StatCard
              icon={<MapPin />}
              label="Avg Quality"
              value={`${stats.avgQuality}/100`}
              color="yellow"
            />
            <StatCard
              icon={<DollarSign />}
              label="Sales Revenue"
              value={earnings ? formatCurrency(earnings.sales.totalNet) : formatCurrency(0)}
              color="green"
            />
            <StatCard
              icon={<Gift />}
              label="Tips Earned"
              value={earnings ? formatCurrency(earnings.tips.totalNet) : formatCurrency(0)}
              color="purple"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/farmer/lots/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Create New Lot</span>
            </Link>
            <Link
              href="/dashboard/farmer/profile"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <MapPin className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Update Farm Info</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Browse Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Earnings Breakdown */}
        {earnings && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-6">Earnings Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sales Revenue */}
              <div className="border border-coffee-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900">Sales Revenue</h3>
                    <p className="text-sm text-coffee-600">From coffee lot sales</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Total Transactions:</span>
                    <span className="font-semibold text-coffee-900">{earnings.sales.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Gross Amount:</span>
                    <span className="font-semibold text-coffee-900">{formatCurrency(earnings.sales.totalGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Deductions:</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(earnings.sales.totalGross - earnings.sales.totalNet)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-coffee-200">
                    <span className="font-semibold text-coffee-900">Net Earnings:</span>
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(earnings.sales.totalNet)}</span>
                  </div>
                </div>
              </div>

              {/* Tips Revenue */}
              <div className="border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-coffee-900">Tips Earned</h3>
                    <p className="text-sm text-coffee-600">From buyer appreciation</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Total Tips:</span>
                    <span className="font-semibold text-coffee-900">{earnings.tips.tipCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Gross Amount:</span>
                    <span className="font-semibold text-coffee-900">{formatCurrency(earnings.tips.totalGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-coffee-600">Platform Fee (3%):</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(earnings.tips.totalFees)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-200">
                    <span className="font-semibold text-coffee-900">Net Earnings:</span>
                    <span className="font-bold text-purple-600 text-lg">{formatCurrency(earnings.tips.totalNet)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="mt-6 p-4 bg-coffee-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-coffee-900 text-lg">Total Net Earnings</h3>
                  <p className="text-sm text-coffee-600">Combined sales + tips</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-coffee-900">{formatCurrency(earnings.totals.totalEarnings)}</p>
                  <p className="text-sm text-coffee-600 mt-1">
                    {earnings.sales.transactionCount + earnings.tips.tipCount} total transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Lots */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Your Coffee Lots</h2>
          
          {loading ? (
            <p className="text-coffee-600">Loading lots...</p>
          ) : lots.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600 mb-4">You haven't created any lots yet.</p>
              <Link
                href="/dashboard/farmer/lots/new"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Your First Lot
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-coffee-200">
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Trace ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Variety</th>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Harvest Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => (
                    <tr key={lot._id} className="border-b border-coffee-100 hover:bg-coffee-50">
                      <td className="py-3 px-4">
                        <code className="text-sm text-coffee-600">{lot.traceId.slice(0, 8)}...</code>
                      </td>
                      <td className="py-3 px-4 text-coffee-900">{lot.variety}</td>
                      <td className="py-3 px-4 text-coffee-900">{formatWeight(lot.quantityKg)}</td>
                      <td className="py-3 px-4 text-coffee-600">{formatDate(lot.harvestDate)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lot.status)}`}>
                          {lot.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/lot/${lot.traceId}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View Trace
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

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
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

function getStatusColor(status) {
  const colors = {
    harvested: 'bg-yellow-100 text-yellow-800',
    processed: 'bg-blue-100 text-blue-800',
    stored: 'bg-purple-100 text-purple-800',
    listed: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
