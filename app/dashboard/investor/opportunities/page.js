'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Users,
  Leaf,
  TrendingUp,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { formatCurrency } from '../../../../lib/formatters';

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCoop, setSelectedCoop] = useState(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    investorEmail: '',
    investmentAmount: '',
    investmentTerm: 'Seasonal',
    riskLevel: 'medium',
    investmentGoals: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCooperatives();
  }, [search]);

  const fetchCooperatives = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        includeFarmers: 'true',
        limit: '50',
      });
      if (search) query.append('search', search);

      const response = await fetch(`/api/cooperatives?${query}`);
      const data = await response.json();

      if (data.success) {
        setCooperatives(data.cooperatives);
      }
    } catch (error) {
      console.error('Failed to fetch cooperatives:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load cooperatives',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvestClick = (coop) => {
    setSelectedCoop(coop);
    setShowInvestModal(true);
    setInvestmentForm({
      investorEmail: '',
      investmentAmount: '',
      investmentTerm: 'Seasonal',
      riskLevel: 'medium',
      investmentGoals: '',
    });
  };

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/investor/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorEmail: investmentForm.investorEmail,
          cooperativeId: selectedCoop._id,
          investmentAmount: parseInt(investmentForm.investmentAmount),
          currency: 'UGX',
          investmentTerm: investmentForm.investmentTerm,
          riskLevel: investmentForm.riskLevel,
          investmentGoals: investmentForm.investmentGoals,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const accountInfo = data.investorAccount?.isNewAccount 
          ? `✓ New account created: ${data.investorAccount.email} (Password: investor123)`
          : `✓ Investment added to existing account: ${data.investorAccount.email}`;
        
        setMessage({
          type: 'success',
          text: `Investment of UGX ${parseInt(investmentForm.investmentAmount).toLocaleString()} in ${selectedCoop.name} created successfully!\n${accountInfo}`,
        });
        setShowInvestModal(false);
        setInvestmentForm({
          investorEmail: '',
          investmentAmount: '',
          investmentTerm: 'Seasonal',
          riskLevel: 'medium',
          investmentGoals: '',
        });
        // Refresh cooperatives
        setTimeout(() => fetchCooperatives(), 1500);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to create investment',
        });
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCoops =
    search === ''
      ? cooperatives
      : cooperatives.filter(
          (coop) =>
            coop.name.toLowerCase().includes(search.toLowerCase()) ||
            coop.address?.region?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <RequireAuth requiredRole="investor">
      <DashboardLayout title="Investment Opportunities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-900 mb-2">
              Investment Opportunities
            </h1>
            <p className="text-coffee-600">
              Discover and invest in coffee farming cooperatives
            </p>
          </div>

          {/* Status Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`text-sm font-medium ${
                  message.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-coffee-400" />
              <input
                type="text"
                placeholder="Search cooperatives by name or region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Cooperatives Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-200 rounded-full animate-pulse mx-auto mb-4" />
                <p className="text-coffee-600">Loading opportunities...</p>
              </div>
            </div>
          ) : filteredCoops.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Leaf className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <p className="text-coffee-600 font-medium">
                {search ? 'No cooperatives found matching your search' : 'No cooperatives available'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoops.map((coop) => (
                <div
                  key={coop._id}
                  className="bg-white rounded-lg shadow-sm border border-coffee-100 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Cooperative Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-coffee-100">
                    <h3 className="font-bold text-lg text-coffee-900 mb-1">
                      {coop.name}
                    </h3>
                    {coop.address?.region && (
                      <div className="flex items-center gap-1 text-sm text-coffee-600">
                        <MapPin className="h-4 w-4" />
                        {coop.address.region}
                        {coop.address.country && `, ${coop.address.country}`}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    {/* Description */}
                    {coop.description && (
                      <p className="text-sm text-coffee-600 line-clamp-2">
                        {coop.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-coffee-100">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-coffee-600">Farmers</p>
                          <p className="font-bold text-coffee-900">
                            {coop.farmerCount || coop.memberCount || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary-600" />
                        <div>
                          <p className="text-xs text-coffee-600">Est. Year</p>
                          <p className="font-bold text-coffee-900">
                            {coop.establishedYear || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    {coop.certifications && coop.certifications.length > 0 && (
                      <div className="pt-2 border-t border-coffee-100">
                        <p className="text-xs text-coffee-600 font-medium mb-2">
                          Certifications
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {coop.certifications
                            .slice(0, 3)
                            .map((cert, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium"
                              >
                                <Check className="h-3 w-3" />
                                {cert.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="p-4 border-t border-coffee-100 bg-gray-50">
                    <button
                      onClick={() => handleInvestClick(coop)}
                      className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Investment Modal */}
          {showInvestModal && selectedCoop && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-coffee-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-coffee-900">
                      Invest in {selectedCoop.name}
                    </h2>
                    <p className="text-sm text-coffee-600 mt-1">
                      {selectedCoop.address?.region}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInvestModal(false)}
                    className="text-coffee-600 hover:text-coffee-900"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleInvestmentSubmit} className="p-6 space-y-4">
                  {/* Investor Email */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Investor Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={investmentForm.investorEmail}
                      onChange={(e) =>
                        setInvestmentForm({
                          ...investmentForm,
                          investorEmail: e.target.value,
                        })
                      }
                      placeholder="investor@example.com"
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-coffee-500 mt-1">Investor login credentials: Email + Password: investor123</p>
                  </div>

                  {/* Admin Info */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Admin (You)
                    </label>
                    <div className="px-3 py-2 border border-coffee-300 rounded-lg bg-coffee-50 text-coffee-900 font-medium">
                      {session?.user?.email || session?.user?.name || 'Admin'}
                    </div>
                  </div>

                  {/* Cooperative Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>{selectedCoop.farmerCount || 0} farmers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="h-4 w-4 text-primary-600" />
                      <span>
                        Established: {selectedCoop.establishedYear || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Investment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Investment Amount (UGX) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      required
                      value={investmentForm.investmentAmount}
                      onChange={(e) =>
                        setInvestmentForm({
                          ...investmentForm,
                          investmentAmount: e.target.value,
                        })
                      }
                      placeholder="Enter amount in UGX"
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Investment Term */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Investment Term
                    </label>
                    <select
                      value={investmentForm.investmentTerm}
                      onChange={(e) =>
                        setInvestmentForm({
                          ...investmentForm,
                          investmentTerm: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Seasonal">Seasonal (~9 months)</option>
                      <option value="1-year">1 Year</option>
                      <option value="2-year">2 Years</option>
                      <option value="3-year">3 Years</option>
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Risk Level
                    </label>
                    <select
                      value={investmentForm.riskLevel}
                      onChange={(e) =>
                        setInvestmentForm({
                          ...investmentForm,
                          riskLevel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="low">Low Risk (Conservative)</option>
                      <option value="medium">Medium Risk (Balanced)</option>
                      <option value="high">High Risk (Growth)</option>
                    </select>
                  </div>

                  {/* Investment Goals */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Investment Goals (Optional)
                    </label>
                    <textarea
                      value={investmentForm.investmentGoals}
                      onChange={(e) =>
                        setInvestmentForm({
                          ...investmentForm,
                          investmentGoals: e.target.value,
                        })
                      }
                      placeholder="E.g., Support sustainable farming, carbon offset, community development"
                      rows="3"
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInvestModal(false)}
                      className="flex-1 py-2 border border-coffee-300 text-coffee-700 rounded-lg hover:bg-coffee-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !investmentForm.investmentAmount}
                      className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {submitting ? 'Creating...' : 'Confirm Investment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
