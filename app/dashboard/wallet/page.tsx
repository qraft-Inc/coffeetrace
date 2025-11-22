'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Wallet as WalletIcon,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Transaction {
  transactionId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  reference: string;
  createdAt: string;
  relatedTip?: {
    tipId: string;
    amount: number;
    buyer: {
      name: string;
      email: string;
    };
  };
}

interface WalletData {
  wallet: {
    walletId: string;
    balance: number;
    currency: string;
    lastUpdated: string;
  };
  farmer: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export default function WalletPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    fetchWalletData();
  }, [currentPage, filterType]);

  const fetchWalletData = async () => {
    try {
      setRefreshing(true);

      // Fetch wallet info
      const walletRes = await fetch('/api/wallet');
      const walletData = await walletRes.json();
      setWallet(walletData);

      // Fetch transactions
      const typeParam = filterType !== 'all' ? `&type=${filterType}` : '';
      const txRes = await fetch(
        `/api/wallet/transactions?page=${currentPage}&limit=20${typeParam}`
      );
      const txData = await txRes.json();

      setTransactions(txData.transactions || []);
      setTotalPages(txData.pagination?.pages || 1);

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600 mt-1">
              Manage your earnings and view transaction history
            </p>
          </div>
          <button
            onClick={fetchWalletData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <WalletIcon className="w-8 h-8" />
              <span className="text-sm opacity-90">Current Balance</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(wallet?.wallet.balance || 0, wallet?.wallet.currency)}
            </div>
            <p className="text-sm opacity-75">
              Last updated: {wallet?.wallet.lastUpdated ? formatDate(wallet.wallet.lastUpdated) : 'N/A'}
            </p>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-600">Total Earned</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(
                transactions
                  .filter(tx => tx.type === 'credit')
                  .reduce((sum, tx) => sum + tx.amount, 0),
                wallet?.wallet.currency
              )}
            </div>
            <p className="text-sm text-gray-500">All-time tips received</p>
          </div>

          {/* Pending Payout */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
              <span className="text-sm text-gray-600">Next Payout</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {wallet?.wallet.balance && wallet.wallet.balance >= 50000 ? (
                <span className="text-green-600">Ready</span>
              ) : (
                <span className="text-gray-400">Pending</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {wallet?.wallet.balance && wallet.wallet.balance >= 50000
                ? 'Scheduled for tonight at 8 PM'
                : `Need ${formatCurrency(50000 - (wallet?.wallet.balance || 0))} more`}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'credit'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'debit'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Debits
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.transactionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          tx.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {tx.type === 'credit' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(tx.createdAt)}
                        </p>
                        {tx.relatedTip && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>From: {tx.relatedTip.buyer.name}</p>
                            <p className="text-xs text-gray-500">
                              Tip ID: {tx.relatedTip.tipId}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Ref: {tx.reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Balance: {formatCurrency(tx.balanceAfter, tx.currency)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {tx.status}
                      </span>
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
