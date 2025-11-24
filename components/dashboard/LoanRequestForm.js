'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText } from 'lucide-react';

export default function LoanRequestForm({ farmerId }) {
  const [formData, setFormData] = useState({
    principalAmount: '',
    purpose: 'seeds_purchase',
    dueDate: '',
    collateral: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const purposes = [
    { value: 'seeds_purchase', label: 'Seeds Purchase' },
    { value: 'fertilizer_purchase', label: 'Fertilizer Purchase' },
    { value: 'labor_costs', label: 'Labor Costs' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'land_preparation', label: 'Land Preparation' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'general_farming', label: 'General Farming' },
    { value: 'other', label: 'Other' },
  ];

  const calculateLoan = () => {
    const principal = parseFloat(formData.principalAmount) || 0;
    const interestRate = 10; // 10% interest
    const interest = (principal * interestRate) / 100;
    const total = principal + interest;
    return { principal, interest, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!farmerId) {
      setError('Farmer profile required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          farmerId,
          principalAmount: parseFloat(formData.principalAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit loan request');
      }

      setSuccess('Loan request submitted successfully! Awaiting approval.');
      setFormData({
        principalAmount: '',
        purpose: 'seeds_purchase',
        dueDate: '',
        collateral: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loan = calculateLoan();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6">
      <h3 className="text-xl font-semibold text-coffee-900 mb-4">Request Pre-Harvest Loan</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Loan Amount (UGX) *
          </label>
          <input
            type="number"
            value={formData.principalAmount}
            onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
            min="50000"
            step="10000"
            required
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Enter amount"
          />
          <p className="mt-1 text-xs text-coffee-600">Minimum: UGX 50,000</p>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Purpose *
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            {purposes.map((purpose) => (
              <option key={purpose.value} value={purpose.value}>
                {purpose.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Repayment Due Date *
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Collateral */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Collateral Description *
          </label>
          <textarea
            value={formData.collateral}
            onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
            rows={3}
            required
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Expected harvest from 6 acres of Arabica coffee"
          />
        </div>

        {/* Loan Summary */}
        {formData.principalAmount && (
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-semibold text-primary-900 mb-2">Loan Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-700">Principal Amount:</span>
                <span className="font-semibold text-primary-900">UGX {loan.principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Interest (10%):</span>
                <span className="font-semibold text-primary-900">UGX {loan.interest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-300">
                <span className="text-primary-700 font-semibold">Total Repayment:</span>
                <span className="font-bold text-primary-900">UGX {loan.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Submitting...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              Submit Loan Request
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your loan request will be reviewed by our finance team. 
          Approval typically takes 2-3 business days. Funds will be disbursed to your wallet once approved.
        </p>
      </div>
    </div>
  );
}
