'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Coffee, MapPin, Award, Calendar, Scale, Droplets, Heart, User, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface LotData {
  _id: string;
  traceId: string;
  variety: string;
  quantityKg: number;
  harvestDate: string;
  moisture?: number;
  qualityScore?: number;
  status: string;
  qrCodeUrl?: string;
  events: Array<{
    step: string;
    timestamp: string;
    note?: string;
    gps?: {
      coordinates: number[];
    };
  }>;
  farmerId: {
    _id: string;
    name: string;
    address?: {
      village?: string;
      district?: string;
      region?: string;
    };
    certifications?: Array<{
      name: string;
    }>;
  };
}

export default function LotTraceabilityPage({ params }: { params: { lotId: string } }) {
  const router = useRouter();
  const [lot, setLot] = useState<LotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLot();
  }, [params.lotId]);

  const fetchLot = async () => {
    try {
      const res = await fetch(`/api/lots/${params.lotId}`);
      if (!res.ok) throw new Error('Lot not found');
      
      const data = await res.json();
      setLot(data.lot);
    } catch (err) {
      setError('Failed to load lot information');
    } finally {
      setLoading(false);
    }
  };

  const handleTipFarmer = () => {
    if (lot?.farmerId?._id) {
      router.push(`/tip/${lot.farmerId._id}?lot=${params.lotId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lot Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const eventSteps = [
    { key: 'harvested', label: 'Harvested', icon: '🌱' },
    { key: 'processed', label: 'Processed', icon: '⚙️' },
    { key: 'dried', label: 'Dried', icon: '☀️' },
    { key: 'graded', label: 'Graded', icon: '📊' },
    { key: 'bagged', label: 'Bagged', icon: '📦' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
  ];

  const completedSteps = lot.events.map(e => e.step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Coffee className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">
            Coffee Traceability
          </h1>
          <p className="text-lg text-coffee-600">
            Full journey from farm to cup
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm text-coffee-600">Trace ID:</span>
            <code className="font-mono font-semibold text-primary-600">{lot.traceId}</code>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Lot Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-4">Lot Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Coffee className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Variety</p>
                    <p className="text-lg font-semibold text-coffee-900">{lot.variety}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Quantity</p>
                    <p className="text-lg font-semibold text-coffee-900">{lot.quantityKg} kg</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Harvest Date</p>
                    <p className="text-lg font-semibold text-coffee-900">
                      {new Date(lot.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {lot.moisture && (
                  <div className="flex items-start gap-3">
                    <Droplets className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-coffee-600">Moisture</p>
                      <p className="text-lg font-semibold text-coffee-900">{lot.moisture}%</p>
                    </div>
                  </div>
                )}

                {lot.qualityScore && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm text-coffee-600">Quality Score</p>
                      <p className="text-lg font-semibold text-coffee-900">{lot.qualityScore}/100</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Status</p>
                    <p className="text-lg font-semibold text-coffee-900 capitalize">{lot.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-coffee-900 mb-6">Processing Journey</h2>
              
              {/* Visual Timeline */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  {eventSteps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        completedSteps.includes(step.key)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {completedSteps.includes(step.key) ? '✓' : step.icon}
                      </div>
                      <p className={`text-xs mt-2 text-center ${
                        completedSteps.includes(step.key) ? 'text-coffee-900 font-semibold' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {index < eventSteps.length - 1 && (
                        <div className="absolute w-full h-0.5 top-6 left-1/2 -z-10" 
                          style={{ 
                            background: completedSteps.includes(step.key) && completedSteps.includes(eventSteps[index + 1].key)
                              ? '#059669' 
                              : '#E5E7EB'
                          }} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Events */}
              <div className="space-y-4">
                {lot.events.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-coffee-900 capitalize">
                          {event.step.replace('_', ' ')}
                        </h3>
                        <span className="text-sm text-coffee-600">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-sm text-coffee-600">{event.note}</p>
                      )}
                      {event.gps?.coordinates && (
                        <p className="text-xs text-coffee-500 mt-1">
                          📍 {event.gps.coordinates[1].toFixed(4)}, {event.gps.coordinates[0].toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Farmer Info & CTA */}
          <div className="space-y-6">
            {/* Farmer Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-coffee-900">The Farmer</h2>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-coffee-900">{lot.farmerId.name}</h3>
                {lot.farmerId.address && (
                  <div className="flex items-center justify-center gap-2 text-coffee-600 mt-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {lot.farmerId.address.district}, {lot.farmerId.address.region}
                    </span>
                  </div>
                )}
              </div>

              {lot.farmerId.certifications && lot.farmerId.certifications.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-coffee-700 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {lot.farmerId.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                      >
                        {typeof cert === 'string' ? cert : cert?.name || 'Certified'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip CTA */}
              <button
                onClick={handleTipFarmer}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Heart className="h-5 w-5" />
                Tip This Farmer
              </button>

              <p className="text-xs text-center text-coffee-500 mt-3">
                Support sustainable coffee farming
              </p>
            </div>

            {/* QR Code */}
            {lot.qrCodeUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-bold text-coffee-900 mb-4">Share This Lot</h3>
                <Image
                  src={lot.qrCodeUrl}
                  alt="Lot QR Code"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg"
                />
                <p className="text-sm text-coffee-600 mt-3">
                  Scan to view traceability
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
