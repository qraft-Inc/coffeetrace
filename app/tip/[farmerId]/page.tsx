'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Coffee, MapPin, Award, Loader2, CheckCircle } from 'lucide-react';

interface FarmerData {
  _id: string;
  name: string;
  phoneNumber?: string;
  address?: {
    village?: string;
    district?: string;
    region?: string;
    country?: string;
  };
  farmSize?: number;
  certifications?: Array<{
    name: string;
  }>;
  qrCodeUrl?: string;
}

export default function TipFarmerPage({ params }: { params: { farmerId: string } }) {
  const router = useRouter();
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [amount, setAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFarmer();
  }, [params.farmerId]);

  const fetchFarmer = async () => {
    try {
      const res = await fetch(`/api/farmers/${params.farmerId}`);
      if (!res.ok) throw new Error('Farmer not found');
      
      const data = await res.json();
      setFarmer(data.farmer);
    } catch (err) {
      setError('Failed to load farmer information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const tipAmount = parseFloat(amount);
      if (isNaN(tipAmount) || tipAmount < 1000) {
        throw new Error('Minimum tip amount is UGX 1,000');
      }

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: params.farmerId,
          amount: tipAmount,
          currency: 'UGX',
          buyer_metadata: {
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
            message: message,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Redirect to Onafriq checkout
      if (data.checkout?.url) {
        window.location.href = data.checkout.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !farmer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Farmer Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">
            Support a Coffee Farmer
          </h1>
          <p className="text-lg text-coffee-600">
            Your tip goes directly to the farmer growing your coffee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Farmer Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-coffee-900">{farmer?.name}</h2>
              {farmer?.address && (
                <div className="flex items-center justify-center gap-2 text-coffee-600 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {farmer.address.district}, {farmer.address.region}
                  </span>
                </div>
              )}
            </div>

            {farmer?.farmSize && (
              <div className="bg-coffee-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-coffee-600">Farm Size</p>
                <p className="text-2xl font-bold text-coffee-900">{farmer.farmSizeUnit === 'hectares' ? (farmer.farmSize * 2.47105).toFixed(1) : farmer.farmSize} acres</p>
              </div>
            )}

            {farmer?.certifications && farmer.certifications.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary-600" />
                  <p className="font-semibold text-coffee-900">Certifications</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {farmer.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {typeof cert === 'string' ? cert : cert?.name || 'Certified'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-coffee-600 leading-relaxed">
                Your tip supports sustainable coffee farming practices and helps improve
                the livelihoods of hardworking farmers like {farmer?.name}.
              </p>
            </div>
          </div>

          {/* Tip Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-coffee-900 mb-6">Send a Tip</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tip Amount */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Tip Amount (UGX) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1000"
                  step="1000"
                  required
                  placeholder="10,000"
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                />
                <p className="text-xs text-coffee-500 mt-1">Minimum: UGX 1,000</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="px-4 py-2 border-2 border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    {(preset / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Buyer Info */}
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+256 700 123 456"
                  className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Thank you for the amazing coffee!"
                  className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Fee Notice */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-coffee-50 rounded-lg p-4">
                  <p className="text-sm text-coffee-600">
                    Platform fee (3%): UGX {(parseFloat(amount) * 0.03).toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-coffee-900">
                    Farmer receives: UGX {(parseFloat(amount) * 0.97).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    Send Tip
                  </>
                )}
              </button>

              <p className="text-xs text-center text-coffee-500 mt-2">
                Secure payment powered by Onafriq
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
