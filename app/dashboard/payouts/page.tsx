'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Phone,
  Calendar,
} from 'lucide-react';

interface Payout {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  destination: {
    type: string;
    msisdn: string;
  };
  psp_reference?: string;
  failure_reason?: string;
  retry_count: number;
  initiated_at: string;
  executed_at?: string;
  completed_at?: string;
}

export default function PayoutsPage() {
  const { data: session } = useSession();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPayouts();
  }, [currentPage, filterStatus]);

  const fetchPayouts = async () => {
    try {
      setRefreshing(true);
      const statusParam = filterStatus !== 'all' ? `&status=${filterStatus}` : '';
      const response = await fetch(
        `/api/payouts?page=${currentPage}&limit=20${statusParam}`
      );
      const data = await response.json();

      setPayouts(data.payouts || []);
      setTotalPages(data.pagination?.pages || 1);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    if (currency === 'UGX') {
      return `${amount.toLocaleString()} UGX`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout History</h1>
            <p className="text-gray-600 mt-1">
              Track your mobile money disbursements and their status
            </p>
          </div>
          <button
            onClick={fetchPayouts}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">Successful</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payouts.filter(p => p.status === 'success').length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-amber-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payouts.filter(p => p.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">Processing</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payouts.filter(p => p.status === 'processing').length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm text-gray-600">Failed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payouts.filter(p => p.status === 'failed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('success')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Payouts List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Payouts</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {payouts.length === 0 ? (
              <div className="p-12 text-center">
                <ArrowRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Payouts are automatically processed daily at 8 PM when your balance exceeds 50,000 UGX
                </p>
              </div>
            ) : (
              payouts.map((payout) => (
                <div key={payout.payoutId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(payout.amount, payout.currency)}
                        </p>
                        {getStatusBadge(payout.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{payout.destination.msisdn}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(payout.initiated_at)}</span>
                        </div>
                      </div>

                      {payout.psp_reference && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reference: {payout.psp_reference}
                        </p>
                      )}

                      {payout.failure_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-medium">Failure Reason:</p>
                          <p className="text-sm text-red-700 mt-1">{payout.failure_reason}</p>
                          {payout.retry_count > 0 && (
                            <p className="text-xs text-red-600 mt-2">
                              Retry attempts: {payout.retry_count}/3
                            </p>
                          )}
                        </div>
                      )}

                      {payout.completed_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Completed: {formatDate(payout.completed_at)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Payout ID</p>
                      <p className="text-xs font-mono text-gray-600">{payout.payoutId}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
