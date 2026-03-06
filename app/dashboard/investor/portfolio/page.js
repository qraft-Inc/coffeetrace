'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Leaf,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import StatCard from '../../../../components/dashboard/StatCard';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { formatCurrency, formatWeight } from '../../../../lib/formatters';

export default function PortfolioPage() {
  const { data: session } = useSession();
  const [investments, setInvestments] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed

  useEffect(() => {
    if (session?.user) {
      fetchPortfolioData();
    }
  }, [session]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`/api/investor/investments?status=${filterStatus}`);
      const data = await response.json();

      if (data.success) {
        setInvestments(data.investments);

        // Calculate portfolio totals
        const activeInvestments = data.investments.filter((i) => i.status === 'active' || i.status === 'pending' || i.status === 'approved');
        const totalInvested = data.investments.reduce((sum, i) => sum + i.investmentAmount, 0);
        const totalCurrentValue = data.investments.reduce((sum, i) => sum + i.currentValue, 0);
        const totalGains = totalCurrentValue - totalInvested;
        const gainPercentage = totalInvested > 0 ? ((totalGains / totalInvested) * 100).toFixed(2) : '0.00';

        setPortfolio({
          totalInvested,
          totalCurrentValue,
          totalGains,
          gainPercentage,
          activeCount: activeInvestments.length,
          completedCount: data.investments.filter((i) => i.status === 'completed').length,
          averageReturn: (
            data.investments.reduce((sum, i) => sum + i.expectedReturnPercentage, 0) /
            (data.investments.length || 1)
          ).toFixed(2),
          totalFarmers: data.investments.reduce((sum, i) => sum + (i.cooperativeFarmerCount || 0), 0),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      setLoading(false);
    }
  };

  const filteredInvestments =
    filterStatus === 'all'
      ? investments
      : investments.filter((i) => {
          if (filterStatus === 'active') {
            return ['active', 'pending', 'approved'].includes(i.status);
          }
          return i.status === filterStatus;
        });

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReturnIcon = (currentValue, investmentAmount) => {
    const isPositive = currentValue >= investmentAmount;
    return isPositive ? (
      <ArrowUpRight className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowDownRight className="h-5 w-5 text-red-600" />
    );
  };

  if (loading) {
    return (
      <RequireAuth requiredRole="investor">
        <DashboardLayout title="My Portfolio">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-200 rounded-full animate-pulse mx-auto mb-4" />
                <p className="text-coffee-600">Loading portfolio...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth requiredRole="investor">
      <DashboardLayout title="My Portfolio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-coffee-900">My Portfolio</h1>
                <p className="text-coffee-600 mt-1">Track all your investments and returns</p>
              </div>
              <Link
                href="/dashboard/investor/opportunities"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                + New Investment
              </Link>
            </div>
          </div>

          {/* Portfolio Summary Stats */}
          {portfolio && (
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <StatCard
                icon={<DollarSign className="h-6 w-6" />}
                label="Total Invested"
                value={formatCurrency(portfolio.totalInvested)}
                color="blue"
              />
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Current Value"
                value={formatCurrency(portfolio.totalCurrentValue)}
                color="green"
              />
              <StatCard
                icon={<DollarSign className="h-6 w-6" />}
                label="Total Gains"
                value={`${formatCurrency(portfolio.totalGains)} (${portfolio.gainPercentage}%)`}
                color={portfolio.totalGains >= 0 ? 'green' : 'red'}
              />
              <StatCard
                icon={<BarChart3 className="h-6 w-6" />}
                label="Avg. Return"
                value={`${portfolio.averageReturn}%`}
                color="purple"
              />
              <StatCard
                icon={<Users className="h-6 w-6" />}
                label="Farmers Supported"
                value={portfolio.totalFarmers}
                color="green"
              />
            </div>
          )}

          {/* Active vs Completed Summary */}
          {portfolio && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Active Investments */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-coffee-600 text-sm font-medium">Active Investments</p>
                    <p className="text-3xl font-bold text-coffee-900 mt-1">
                      {portfolio.activeCount}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Completed Investments */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-coffee-600 text-sm font-medium">Completed Investments</p>
                    <p className="text-3xl font-bold text-coffee-900 mt-1">
                      {portfolio.completedCount}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'active', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-coffee-300 text-coffee-700 hover:border-primary-400'
                }`}
              >
                {status === 'all' ? `All (${investments.length})` : `${status} (${investments.filter((i) => {
                  if (status === 'active') return ['active', 'pending', 'approved'].includes(i.status);
                  return i.status === status;
                }).length})`}
              </button>
            ))}
          </div>

          {/* Investments List */}
          <div className="space-y-4">
            {filteredInvestments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Building2 className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
                <p className="text-coffee-600 font-medium">No {filterStatus} investments found</p>
                <p className="text-coffee-500 text-sm mt-1">
                  {filterStatus === 'all'
                    ? 'Start investing to build your portfolio'
                    : `You don't have any ${filterStatus} investments yet`}
                </p>
                {filterStatus === 'all' && (
                  <Link
                    href="/dashboard/investor/opportunities"
                    className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                  >
                    Explore Opportunities
                  </Link>
                )}
              </div>
            ) : (
              filteredInvestments.map((investment) => {
                const returnAmount = investment.currentValue - investment.investmentAmount;
                const returnPercentage = ((returnAmount / investment.investmentAmount) * 100).toFixed(2);
                const isPositiveReturn = returnAmount >= 0;

                return (
                  <div
                    key={investment._id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-coffee-100"
                  >
                    <div className="grid md:grid-cols-5 gap-6">
                      {/* Investment Details */}
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-coffee-900 text-lg truncate">
                              {investment.cooperativeName}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeColor(
                                investment.riskLevel
                              )}`}>
                                {investment.riskLevel.charAt(0).toUpperCase() + investment.riskLevel.slice(1)} Risk
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                ['active', 'pending', 'approved'].includes(investment.status)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-coffee-600 text-sm mt-2">
                              {investment.region} • {investment.coffeeType}
                            </p>
                            <p className="text-coffee-500 text-xs mt-1">
                              {investment.cooperativeFarmerCount || 0} farmers • Est. harvest: {investment.expectedMaturityDate ? new Date(investment.expectedMaturityDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Investment Amount */}
                      <div className="flex flex-col justify-center">
                        <p className="text-coffee-600 text-sm font-medium">Investment</p>
                        <p className="text-xl font-bold text-coffee-900">
                          {formatCurrency(investment.investmentAmount)}
                        </p>
                        <p className="text-coffee-500 text-xs mt-1">
                          {new Date(investment.investmentDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Current Value */}
                      <div className="flex flex-col justify-center">
                        <p className="text-coffee-600 text-sm font-medium">Current Value</p>
                        <p className="text-xl font-bold text-coffee-900">
                          {formatCurrency(investment.currentValue)}
                        </p>
                        <p className="text-coffee-500 text-xs mt-1">Expected Return: {investment.expectedReturnPercentage}%</p>
                      </div>

                      {/* Returns */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-coffee-600 text-sm font-medium">Gain/Loss</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getReturnIcon(investment.currentValue, investment.investmentAmount)}
                            <p className={`text-xl font-bold ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(returnAmount)} ({isPositiveReturn ? '+' : ''}{returnPercentage}%)
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/investor/portfolio/${investment._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 mt-2"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {['active', 'pending', 'approved'].includes(investment.status) && (
                      <div className="mt-4 pt-4 border-t border-coffee-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-coffee-600">
                            Time to Maturity
                          </span>
                          <span className="text-xs font-semibold text-coffee-900">
                            {investment.expectedMaturityDate
                              ? Math.ceil((new Date(investment.expectedMaturityDate) - new Date()) / (1000 * 60 * 60 * 24)) + ' days'
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, 100 - (Math.ceil((new Date(investment.expectedMaturityDate) - new Date()) / (1000 * 60 * 60 * 24)) / 365) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Portfolio Insights */}
          {portfolio && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-coffee-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Insights
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-coffee-600 font-medium">Portfolio Diversification</p>
                  <p className="text-coffee-900 font-bold mt-1">
                    {filteredInvestments.length} investments across{' '}
                    {[...new Set(filteredInvestments.map((i) => i.region))].length} regions
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 font-medium">Average Investment Size</p>
                  <p className="text-coffee-900 font-bold mt-1">
                    {formatCurrency(
                      portfolio.totalInvested / investments.length
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 font-medium">Community Impact</p>
                  <p className="text-coffee-900 font-bold mt-1">
                    Supporting {portfolio.totalFarmers} farmers globally
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
