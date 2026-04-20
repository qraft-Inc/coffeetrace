'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  TrendingUp,
  Mail,
  Calendar,
  Activity,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';

export default function AdminInvestorsPage() {
  const { data: session } = useSession();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalInvestors: 0,
    activeInvestors: 0,
    totalInvested: 0,
    totalInvestments: 0,
  });

  useEffect(() => {
    fetchInvestors();
  }, [search]);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: '100' });
      if (search) query.append('search', search);

      const response = await fetch(`/api/investor/list?${query}`);
      const data = await response.json();

      if (data.success) {
        setInvestors(data.investors);

        const totalInvestors = data.investors.length;
        const activeInvestors = data.investors.filter(inv => inv.isActive).length;
        const totalInvested = data.investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
        const totalInvestments = data.investors.reduce((sum, inv) => sum + inv.investmentCount, 0);

        setStats({ totalInvestors, activeInvestors, totalInvested, totalInvestments });
      }
    } catch (error) {
      console.error('Failed to fetch investors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors =
    search === ''
      ? investors
      : investors.filter(
          (investor) =>
            investor.name?.toLowerCase().includes(search.toLowerCase()) ||
            investor.email?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <RequireAuth requiredRole="admin">
      <DashboardLayout title="All Investors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-900 mb-2">All Investors</h1>
            <p className="text-coffee-600">Manage and view all investors in the system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Total Investors</p>
                  <p className="text-3xl font-bold text-coffee-900 mt-1">{stats.totalInvestors}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Active Investors</p>
                  <p className="text-3xl font-bold text-coffee-900 mt-1">{stats.activeInvestors}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Total Invested</p>
                  <p className="text-2xl font-bold text-coffee-900 mt-1">
                    UGX {stats.totalInvested.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Total Investments</p>
                  <p className="text-3xl font-bold text-coffee-900 mt-1">{stats.totalInvestments}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-coffee-400" />
              <input
                type="text"
                placeholder="Search investors by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Investors Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="h-12 w-12 bg-primary-200 rounded-full animate-pulse mx-auto mb-4" />
                  <p className="text-coffee-600">Loading investors...</p>
                </div>
              </div>
            ) : filteredInvestors.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
                <p className="text-coffee-600 font-medium">
                  {search ? 'No investors found matching your search' : 'No investors in the system yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-coffee-50 border-b border-coffee-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Investor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Investments</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Total Invested</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Gains/Loss</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-coffee-900 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-coffee-100">
                    {filteredInvestors.map((investor) => {
                      const gainsPercentage =
                        investor.totalInvested > 0
                          ? ((investor.totalGains / investor.totalInvested) * 100).toFixed(2)
                          : '0.00';
                      const isPositive = investor.totalGains >= 0;

                      return (
                        <tr key={investor._id} className="hover:bg-coffee-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-3">
                                <p className="font-semibold text-coffee-900">{investor.name || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-coffee-600">
                              <Mail className="h-4 w-4" />
                              {investor.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {investor.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-medium">
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <p className="font-semibold text-coffee-900">{investor.investmentCount || 0} total</p>
                              <p className="text-xs text-coffee-500">{investor.activeInvestments || 0} active</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-coffee-900">
                              UGX {investor.totalInvested.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-coffee-900">
                              UGX {investor.totalCurrentValue.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '+' : ''}UGX {investor.totalGains.toLocaleString()}
                              </p>
                              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                ({isPositive ? '+' : ''}{gainsPercentage}%)
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-coffee-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(investor.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          {!loading && filteredInvestors.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-coffee-900 mb-4">Summary</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-coffee-600 font-medium">Average Investment Size</p>
                  <p className="text-coffee-900 font-bold text-lg mt-1">
                    UGX{' '}
                    {stats.totalInvestments > 0
                      ? Math.round(stats.totalInvested / stats.totalInvestments).toLocaleString()
                      : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 font-medium">Active Rate</p>
                  <p className="text-coffee-900 font-bold text-lg mt-1">
                    {stats.totalInvestors > 0
                      ? Math.round((stats.activeInvestors / stats.totalInvestors) * 100)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 font-medium">Investments per Investor</p>
                  <p className="text-coffee-900 font-bold text-lg mt-1">
                    {stats.totalInvestors > 0
                      ? (stats.totalInvestments / stats.totalInvestors).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
