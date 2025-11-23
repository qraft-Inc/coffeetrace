'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, DollarSign, Package, Leaf, Users, Building2, MapPin, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/dashboard/StatCard';
import RequireAuth from '../../../components/dashboard/RequireAuth';
import { formatCurrency, formatCarbon, formatWeight } from '../../../lib/formatters';

export default function InvestorDashboard() {
  const { data: session } = useSession();
  const [investments, setInvestments] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCooperative, setSelectedCooperative] = useState(null);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch cooperatives with farmers
      const coopResponse = await fetch('/api/cooperatives?includeFarmers=true&limit=50');
      const coopData = await coopResponse.json();
      
      if (coopData.success) {
        setCooperatives(coopData.cooperatives);
        
        // Calculate stats from cooperatives
        const totalFarmers = coopData.cooperatives.reduce((sum, coop) => sum + (coop.farmerCount || 0), 0);
        
        setStats({
          totalInvested: 0,
          activeInvestments: 0,
          totalReturns: 0,
          carbonOffset: 0,
          farmersSupported: totalFarmers,
          cooperatives: coopData.cooperatives.length,
        });
      }
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
          <p className="text-coffee-600">Track your investments and impact metrics</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-6 gap-6 mb-8">
            <StatCard
              icon={<Building2 className="h-6 w-6" />}
              label="Cooperatives"
              value={stats.cooperatives}
              color="purple"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Total Farmers"
              value={stats.farmersSupported}
              color="green"
            />
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

        {/* Cooperatives and Farmers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-coffee-900 mb-4">Cooperatives & Farmers</h2>
          
          {loading ? (
            <p className="text-coffee-600">Loading cooperatives...</p>
          ) : cooperatives.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
              <p className="text-coffee-600">No cooperatives found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cooperatives.map((coop) => (
                <div key={coop._id} className="border border-coffee-200 rounded-lg overflow-hidden">
                  {/* Cooperative Header */}
                  <div 
                    className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-colors"
                    onClick={() => setSelectedCooperative(selectedCooperative === coop._id ? null : coop._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Building2 className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-coffee-900">{coop.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-coffee-600 mt-1">
                            {coop.address?.region && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {coop.address.region}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {coop.farmerCount || 0} Farmers
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`h-6 w-6 text-coffee-600 transition-transform ${
                          selectedCooperative === coop._id ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Farmers List (Expandable) */}
                  {selectedCooperative === coop._id && coop.farmers && coop.farmers.length > 0 && (
                    <div className="p-4 bg-gray-50">
                      <h4 className="font-semibold text-coffee-900 mb-3">Farmers in {coop.name}</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {coop.farmers.map((farmer) => (
                          <Link
                            key={farmer._id}
                            href={`/dashboard/buyer/farmers/${farmer._id}`}
                            className="bg-white border border-coffee-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              {farmer.profileImage ? (
                                <img
                                  src={farmer.profileImage}
                                  alt={farmer.farmerName}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                  <Users className="h-6 w-6 text-green-600" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-coffee-900 truncate">
                                  {farmer.farmerName}
                                </h5>
                                <div className="flex items-center gap-2 text-sm text-coffee-600">
                                  {farmer.farmSize && (
                                    <span>{farmer.farmSize} hectares</span>
                                  )}
                                  {farmer.location?.coordinates && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      Location
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
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
