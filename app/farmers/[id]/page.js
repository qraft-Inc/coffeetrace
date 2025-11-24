'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, Leaf, Award, Mountain, Droplet, Sun, Trees, 
  Coffee, Phone, Mail, ArrowLeft, Calendar, Package
} from 'lucide-react';
import dynamic from 'next/dynamic';

const FarmMapPolygon = dynamic(() => import('../../../components/map/FarmMapPolygon'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
});

const TraceabilityQRCode = dynamic(() => import('../../../components/TraceabilityQRCode'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

export default function PublicFarmerProfile({ params }) {
  const router = useRouter();
  const [farmer, setFarmer] = useState(null);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerId, setFarmerId] = useState(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setFarmerId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerData();
    }
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      const res = await fetch(`/api/farmers/${farmerId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch farmer data');
      }

      setFarmer(data.farmer);
      setLots(data.lots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Farmer Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The farmer profile you are looking for does not exist.'}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-green-600" />
              <span className="font-bold text-xl text-gray-900">Coffee Trace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-500">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Coffee className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">{farmer.userId?.name || 'Coffee Farmer'}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">
                  {farmer.location?.district || 'Fort Portal'}, {farmer.location?.country || 'Uganda'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                <Mountain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{farmer.farmSize || 0}</div>
                <div className="text-sm text-gray-600">Hectares</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <Coffee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{lots.length}</div>
                <div className="text-sm text-gray-600">Coffee Lots</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 text-center">
                <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{farmer.certifications?.length || 0}</div>
                <div className="text-sm text-gray-600">Certifications</div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Farm Information</h3>
                  <div className="space-y-3">
                    {farmer.varieties && farmer.varieties.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">Coffee Varieties</div>
                          <div className="text-gray-600">
                            {farmer.varieties.map(v => typeof v === 'string' ? v : v.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                    {farmer.altitude && (
                      <div className="flex items-start gap-3">
                        <Mountain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">Altitude</div>
                          <div className="text-gray-600">
                            {typeof farmer.altitude === 'object' 
                              ? `${farmer.altitude.min}-${farmer.altitude.max}m`
                              : `${farmer.altitude}m`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                    {farmer.farmingPractices && farmer.farmingPractices.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Droplet className="h-5 w-5 text-cyan-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">Farming Practices</div>
                          <div className="text-gray-600">{farmer.farmingPractices.join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {farmer.certifications && farmer.certifications.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {farmer.certifications.map((cert, idx) => {
                        const certName = typeof cert === 'string' ? cert : cert.name;
                        return (
                          <div key={idx} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {certName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {(farmer.userId?.email || farmer.userId?.phone) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact</h3>
                    <div className="space-y-2">
                      {farmer.userId?.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="h-5 w-5 text-green-600" />
                          <span>{farmer.userId.email}</span>
                        </div>
                      )}
                      {farmer.userId?.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span>{farmer.userId.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - QR Code */}
              <div>
                <TraceabilityQRCode 
                  farmerId={farmerId}
                  title="Farmer Traceability QR"
                  description="Scan to verify this farmer's profile and coffee origin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Farm Location Map */}
        {farmer.location?.coordinates && farmer.farmBoundary?.coordinates && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-600" />
                Farm Location
              </h3>
              <div className="rounded-xl overflow-hidden">
                <FarmMapPolygon 
                  location={farmer.location}
                  boundary={farmer.farmBoundary}
                  name={farmer.userId?.name || 'Coffee Farm'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Coffee Lots */}
        {lots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-green-600" />
                Recent Coffee Lots
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lots.map((lot) => (
                  <Link 
                    key={lot._id}
                    href={`/trace/${lot._id}`}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-gray-500">{lot.traceId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        lot.status === 'exported' ? 'bg-blue-100 text-blue-800' :
                        lot.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lot.status}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="font-semibold text-gray-900">{lot.variety || 'Arabica'}</div>
                      <div className="text-sm text-gray-600">{lot.quantityKg} kg</div>
                      {lot.qualityScore && (
                        <div className="flex items-center gap-1 text-sm">
                          <Award className="h-4 w-4 text-amber-600" />
                          <span className="text-gray-600">Score: {lot.qualityScore}/100</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(lot.harvestDate).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
