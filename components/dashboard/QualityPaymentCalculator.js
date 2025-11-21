'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function QualityPaymentCalculator({ lot, onCalculate }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    basePrice: '',
    pricePerKg: '',
  });

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/payments/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: lot._id,
          basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined,
          pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to calculate payment');
      }

      setResult(data);
      if (onCalculate) onCalculate(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <DollarSign className="w-6 h-6 mr-2 text-green-600" />
        Quality-Based Payment Calculator
      </h3>

      <form onSubmit={handleCalculate} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Base Price (RWF)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value, pricePerKg: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 500000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OR Price per Kg (RWF)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerKg}
              onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value, basePrice: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 2500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!formData.basePrice && !formData.pricePerKg)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Calculating...' : 'Calculate Payment with Quality Premium'}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Lot {result.lotNumber}</p>
                <p className="text-lg font-semibold text-gray-900">{result.farmer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Quality Score</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-green-700">{result.qualityScore}</p>
                  {result.grade && (
                    <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                      Grade {result.grade}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Weight: <strong>{result.weight} kg</strong> · 
              Base Price/kg: <strong>{result.pricePerKg.toLocaleString()} RWF</strong>
            </p>
          </div>

          {/* Base Payment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Base Payment</span>
              <span className="text-lg font-semibold">{result.basePrice.toLocaleString()} RWF</span>
            </div>
          </div>

          {/* Quality Premium Breakdown */}
          {result.qualityPremium.breakdown.length > 0 && (
            <div className="border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Quality Premium Breakdown
              </h4>
              <div className="space-y-2">
                {result.qualityPremium.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.factor}</span>
                    <span className={`font-medium ${item.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.impact >= 0 ? '+' : ''}{item.impact.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Quality Premium</span>
                  <span className="text-lg font-bold text-green-600">
                    +{result.qualityPremium.premiumAmount.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Certification Bonuses */}
          {result.qualityPremium.certificationBonuses && result.qualityPremium.certificationBonuses.length > 0 && (
            <div className="border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Certification Bonuses
              </h4>
              <div className="space-y-2">
                {result.qualityPremium.certificationBonuses.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">
                      {cert.certificationType.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-blue-600">
                      +{cert.bonusAmount.toLocaleString()} RWF ({cert.bonusPercentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Payment */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Payment</p>
                <p className="text-3xl font-bold">{result.qualityPremium.totalAmount.toLocaleString()} RWF</p>
                <p className="text-green-100 text-sm mt-1">
                  Premium: +{((result.qualityPremium.totalAmount - result.basePrice) / result.basePrice * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          {/* Info */}
          {result.assessmentCount > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-800">
                ℹ️ Calculation based on {result.assessmentCount} quality assessment{result.assessmentCount > 1 ? 's' : ''} 
                (recent assessments weighted more heavily)
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">
                No quality assessments found. Payment calculated at base price only. 
                Complete quality assessments to unlock premium pricing.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
