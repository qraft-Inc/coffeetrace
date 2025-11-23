'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, DollarSign, Package, Leaf, Users } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
import { formatCurrency, formatCarbon, formatWeight } from '../../../lib/formatters';

export default function InvestorDashboard() {
  const { data: session } = useSession();
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch investor portfolio
      // In production, you'd have /api/investments endpoint
      setStats({
        totalInvested: 0,
        activeInvestments: 0,
        totalReturns: 0,
        carbonOffset: 0,
        farmersSupported: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth requiredRole="investor">
      <DashboardLayout title="Investor Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-coffee-600">Investor Dashboard</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <StatCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Total Invested"
              value={formatCurrency(stats.totalInvested)}
              color="blue"
            />
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Active Investments"
              value={stats.activeInvestments}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Total Returns"
              value={formatCurrency(stats.totalReturns)}
              color="green"
            />
            <StatCard
              icon={<Leaf className="h-6 w-6" />}
              label="Carbon Offset"
              value={formatCarbon(stats.carbonOffset)}
              color="green"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Farmers Supported"
              value={stats.farmersSupported}
              color="purple"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/investor/opportunities"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Browse Opportunities</span>
            </Link>
            <Link
              href="/dashboard/investor/portfolio"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">My Portfolio</span>
            </Link>
            <Link
              href="/dashboard/investor/impact"
              className="flex items-center gap-3 p-4 border-2 border-coffee-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Leaf className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-coffee-900">Impact Report</span>
            </Link>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Active Investments</h2>
          
          {loading ? (
            <p className="text-coffee-600">Loading investments...</p>
          ) : investments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600 mb-4">You haven't made any investments yet.</p>
              <Link
                href="/dashboard/investor/opportunities"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Explore Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((investment) => (
                <div key={investment._id} className="border border-coffee-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-coffee-900">
                        {investment.lot?.farmer?.farmerName}
                      </h3>
                      <p className="text-sm text-coffee-600">
                        {formatWeight(investment.amountKg)} - {investment.lot?.variety}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-900">
                        {formatCurrency(investment.amount)}
                      </p>
                      <span className="text-sm text-green-600">
                        +{investment.roi || 0}% ROI
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Your Impact</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-coffee-900">
                {formatCarbon(stats?.carbonOffset || 0)}
              </p>
              <p className="text-sm text-coffee-600">CO₂ Offset</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-coffee-900">
                {stats?.farmersSupported || 0}
              </p>
              <p className="text-sm text-coffee-600">Farmers Supported</p>
            </div>
            <div className="text-center">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-coffee-900">
                {formatWeight(stats?.totalCoffee || 0)}
              </p>
              <p className="text-sm text-coffee-600">Total Coffee Financed</p>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
