'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Leaf, Award, Package, CheckCircle, Coffee } from 'lucide-react';
import { formatDate, formatWeight, formatCarbon } from '@/lib/formatters';

export default function LotTracePage({ params }) {
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLot();
  }, [params.traceId]);

  const fetchLot = async () => {
    try {
      const res = await fetch(`/api/lots/${params.traceId}`);
      const data = await res.json();
      
      if (res.ok) {
        setLot(data.lot);
      } else {
        setError(data.error || 'Lot not found');
      }
    } catch (err) {
      setError('Failed to load trace data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-coffee-600">Loading trace data...</p>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-coffee-900 mb-2">Lot Not Found</h1>
          <p className="text-coffee-600 mb-6">{error}</p>
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const farmer = lot.farmerId;
  const coop = lot.cooperativeId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-coffee-800">
            Coffee Trace
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {lot.variety} Coffee
              </h1>
              <p className="text-primary-100 mb-4">
                Trace ID: <span className="font-mono font-semibold">{lot.traceId}</span>
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Verified & Traceable</span>
              </div>
            </div>
            
            {lot.qrCodeUrl && (
              <div className="bg-white p-3 rounded-lg">
                <img src={lot.qrCodeUrl} alt="QR Code" className="h-32 w-32" />
              </div>
            )}
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <InfoCard
            icon={<Package />}
            label="Quantity"
            value={formatWeight(lot.quantityKg)}
          />
          <InfoCard
            icon={<Calendar />}
            label="Harvest Date"
            value={formatDate(lot.harvestDate)}
          />
          <InfoCard
            icon={<Award />}
            label="Quality Score"
            value={lot.qualityScore ? `${lot.qualityScore}/100` : 'N/A'}
          />
        </div>

        {/* Farmer Information */}
        {farmer && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Farm Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-coffee-900 mb-2">{farmer.name}</h3>
                {coop && (
                  <p className="text-sm text-coffee-600 mb-2">
                    Member of {coop.name}
                  </p>
                )}
                <div className="space-y-1 text-sm text-coffee-600">
                  {farmer.farmSize && (
                    <p>Farm Size: {farmer.farmSize} hectares</p>
                  )}
                  {farmer.altitude && (
                    <p>Altitude: {farmer.altitude}m above sea level</p>
                  )}
                </div>
              </div>

              <div>
                {farmer.certifications && farmer.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-coffee-900 mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {farmer.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                        >
                          {cert.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing Details */}
        {lot.processingMethod && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-4">
              Processing Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-coffee-700">Method:</span>{' '}
                <span className="text-coffee-600 capitalize">{lot.processingMethod}</span>
              </div>
              {lot.moisture && (
                <div>
                  <span className="font-semibold text-coffee-700">Moisture Content:</span>{' '}
                  <span className="text-coffee-600">{lot.moisture}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Carbon Footprint */}
        {lot.carbonFootprint && (
          <div className="bg-primary-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary-600" />
              Environmental Impact
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-coffee-600 mb-1">Total Carbon Footprint</p>
                <p className="text-2xl font-bold text-coffee-900">
                  {formatCarbon(lot.carbonFootprint.totalKgCO2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-coffee-600 mb-1">Per Kilogram</p>
                <p className="text-2xl font-bold text-coffee-900">
                  {formatCarbon(lot.carbonFootprint.perKgCO2)}/kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trace Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-coffee-900 mb-6">
            Journey Timeline
          </h2>
          
          <div className="relative">
            {lot.events && lot.events.length > 0 ? (
              <div className="space-y-6">
                {lot.events.map((event, idx) => (
                  <TraceEvent
                    key={idx}
                    event={event}
                    isLast={idx === lot.events.length - 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-coffee-600">No trace events recorded yet.</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/marketplace"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse More Coffee
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-primary-600 mb-2">{icon}</div>
      <p className="text-sm text-coffee-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-coffee-900">{value}</p>
    </div>
  );
}

function TraceEvent({ event, isLast }) {
  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-primary-200" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary-600 border-4 border-white" />
      
      <div>
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-coffee-900 capitalize">
            {event.step.replace('_', ' ')}
          </h4>
          <span className="text-sm text-coffee-500">
            {formatDate(event.timestamp, 'MMM dd, yyyy HH:mm')}
          </span>
        </div>
        
        {event.note && (
          <p className="text-sm text-coffee-600 mb-2">{event.note}</p>
        )}
        
        {event.actor && (
          <p className="text-xs text-coffee-500">
            Recorded by: {event.actor.name} ({event.actor.role})
          </p>
        )}
        
        {event.photoUrl && (
          <img
            src={event.photoUrl}
            alt={event.step}
            className="mt-2 rounded-lg max-w-xs"
          />
        )}
      </div>
    </div>
  );
}
