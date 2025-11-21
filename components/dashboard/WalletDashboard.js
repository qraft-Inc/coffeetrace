'use client';

import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function WalletDashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      setWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deposit',
          amount: parseFloat(depositAmount),
          description: 'Wallet deposit',
          paymentMethod: 'mobile_money',
        }),
      });

      if (res.ok) {
        await fetchWallet();
        setShowDepositModal(false);
        setDepositAmount('');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const getTransactionIcon = (type) => {
    if (['deposit', 'loan_disbursement', 'sale_payment', 'refund'].includes(type)) {
      return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
    }
    return <ArrowUpRight className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-100 mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold">
              {wallet?.currency} {wallet?.balance?.toLocaleString() || 0}
            </h2>
          </div>
          <WalletIcon className="h-12 w-12 text-primary-200" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-primary-100 text-sm">Locked Balance</p>
            <p className="text-xl font-semibold">{wallet?.currency} {wallet?.lockedBalance?.toLocaleString() || 0}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Credit Score</p>
            <p className="text-xl font-semibold">{wallet?.creditScore || 50}/100</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Deposit
          </button>
          <button className="flex-1 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors">
            Withdraw
          </button>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-coffee-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-coffee-600">Total Received</p>
              <p className="text-xl font-bold text-coffee-900">
                {wallet?.currency} {wallet?.totalLoansReceived?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-coffee-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-coffee-600">Outstanding</p>
              <p className="text-xl font-bold text-coffee-900">
                {wallet?.currency} {wallet?.outstandingLoanBalance?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-coffee-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-coffee-600">Total Repaid</p>
              <p className="text-xl font-bold text-coffee-900">
                {wallet?.currency} {wallet?.totalLoansRepaid?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6">
        <h3 className="text-lg font-semibold text-coffee-900 mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <p className="text-center text-coffee-600 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div key={txn._id} className="flex items-center justify-between border-b border-coffee-100 pb-3">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(txn.type)}
                  <div>
                    <p className="font-medium text-coffee-900">{txn.description}</p>
                    <p className="text-sm text-coffee-600">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    ['deposit', 'loan_disbursement', 'sale_payment', 'refund'].includes(txn.type)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {['deposit', 'loan_disbursement', 'sale_payment', 'refund'].includes(txn.type) ? '+' : '-'}
                    {txn.currency} {txn.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-coffee-600">
                    Balance: {txn.currency} {txn.balanceAfter.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-coffee-900 mb-4">Deposit Funds</h3>
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Amount ({wallet?.currency})
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1000"
                  step="1000"
                  required
                  className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-coffee-300 text-coffee-700 rounded-lg hover:bg-coffee-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
