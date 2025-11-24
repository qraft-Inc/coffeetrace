'use client';

import { useEffect, useState } from 'react';
import { Award, MapPin, Calendar, TrendingUp, Leaf, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const FarmMapPolygon = dynamic(() => import('../../../components/map/FarmMapPolygon'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
});

const TraceabilityQRCode = dynamic(() => import('../../../components/TraceabilityQRCode'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

export default function TraceabilityPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTraceability();
  }, [params.id]);

  const fetchTraceability = async () => {
    try {
      const res = await fetch(`/api/trace/${params.id}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch traceability data');
      }

      setData(result.traceability);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lot Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">
                    Coffee Traceability
                  </h1>
                  <p className="text-gray-600">Lot Number: {data.lot.lotNumber}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-green-100 px-4 py-2 rounded-full">
                    <span className="text-green-800 font-semibold">{data.lot.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* QR Code Section */}
            <div className="md:col-span-1">
              <TraceabilityQRCode 
                lotId={params.id}
                size={160}
                title="Share This Coffee"
                description="QR verified traceability"
              />
            </div>
          </div>

          {/* Coffee Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Coffee Type</p>
              <p className="text-lg font-semibold text-gray-900">{data.lot.coffeeType}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Processing</p>
              <p className="text-lg font-semibold text-gray-900">{data.lot.processingMethod}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Weight</p>
              <p className="text-lg font-semibold text-gray-900">{data.lot.weight} kg</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Quality Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.quality.averageScore || 'N/A'}
              </p>
            </div>
          </div>

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {cert}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Farmer Information */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center mb-4">
            <Leaf className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Origin</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Farmer</p>
              <p className="text-lg font-semibold text-gray-900 mb-4">{data.farmer.name}</p>

              <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900">{data.farmer.location.district}, {data.farmer.location.country}</p>
                </div>
              </div>

              <div className="flex items-start">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Farm Size</p>
                  <p className="text-gray-900">{data.farmer.farmSize} hectares</p>
                </div>
              </div>
            </div>

            <div>
              {data.farmer.cooperative && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Cooperative</p>
                  <p className="text-lg font-semibold text-green-700">{data.farmer.cooperative}</p>
                </div>
              )}

              {data.farmer.certifications.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Farmer Certifications</p>
                  <div className="space-y-1">
                    {data.farmer.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <Award className="w-4 h-4 text-green-600 mr-2" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Farm Location & Traceability Map */}
        {(data.farmer.location || data.farmer.farmBoundary) && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Farm Location & Traceability</h2>
            </div>
            <FarmMapPolygon
              location={data.farmer.location}
              farmBoundary={data.farmer.farmBoundary}
              farmName={data.farmer.name}
              height="450px"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>This map shows the exact location and boundaries of the farm where this coffee was grown, ensuring complete traceability from farm to cup.</p>
            </div>
          </div>
        )}

        {/* Processing Journey */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Processing Journey</h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-200"></div>

            {/* Timeline Items */}
            <div className="space-y-6">
              {data.journey.harvest && (
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Harvest</p>
                    <p className="text-sm text-gray-600">{new Date(data.journey.harvest).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {data.journey.processing && (
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Processing</p>
                    <p className="text-sm text-gray-600">{new Date(data.journey.processing).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {data.journey.grading && (
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Grading</p>
                    <p className="text-sm text-gray-600">{new Date(data.journey.grading).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {data.journey.export && (
                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">Export</p>
                    <p className="text-sm text-gray-600">{new Date(data.journey.export).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quality Assessments */}
        {data.quality.assessments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Award className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Quality Assessments</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.quality.assessments.map((assessment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {assessment.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-600">{assessment.stage.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                      Grade {assessment.grade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-3">
                    <span className="text-gray-600">Score: <strong>{assessment.score}/100</strong></span>
                    {assessment.moisture && (
                      <span className="text-gray-600">Moisture: <strong>{assessment.moisture}%</strong></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(assessment.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Information */}
        {data.buyer && (
          <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Destination</h2>
            <p className="text-lg text-gray-700">Buyer: <strong>{data.buyer.name}</strong></p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">Verified by CoffeeTrace Platform</p>
          <p className="text-xs mt-1">Blockchain-enabled transparency for coffee supply chains</p>
        </div>
      </div>
    </div>
  );
}
