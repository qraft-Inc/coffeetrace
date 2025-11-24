'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Leaf, Award, Mountain, Droplet, Sun, Trees, 
  Coffee, Phone, Mail, ArrowLeft, Heart, Share2, Calendar 
} from 'lucide-react';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import Link from 'next/link';
import FarmMapPolygon from '../../../../../components/map/FarmMapPolygon';
import dynamicImport from 'next/dynamic';

const TraceabilityQRCode = dynamicImport(() => import('../../../../../components/TraceabilityQRCode'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

export default function FarmerStoryPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [farmerId, setFarmerId] = useState(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFarmerId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerStory();
    }
  }, [farmerId]);

  const fetchFarmerStory = async () => {
    try {
      const response = await fetch(`/api/farmers/${farmerId}`);
      if (response.ok) {
        const data = await response.json();
        setFarmer(data.farmer);
      } else {
        router.push('/dashboard/buyer/farmers');
      }
    } catch (error) {
      console.error('Failed to fetch farmer story:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Farmer Story">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-coffee-600">Loading farmer's story...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!farmer) {
    return (
      <DashboardLayout title="Farmer Story">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
            <p className="text-coffee-600 text-lg">Farmer not found</p>
            <Link
              href="/dashboard/buyer/farmers"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700"
            >
              ← Back to Farmers
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${farmer.name}'s Story`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard/buyer/farmers"
          className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Farmers
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-96 bg-gradient-to-br from-green-100 to-green-200">
            {farmer.profilePhotoUrl || (farmer.photos && farmer.photos[0]?.url) ? (
              <img
                src={farmer.profilePhotoUrl || farmer.photos[0]?.url}
                alt={farmer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee className="h-32 w-32 text-green-600 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{farmer.name}</h1>
              {farmer.location && (
                <p className="text-xl flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" />
                  {[farmer.location.district, farmer.location.region, farmer.location.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {farmer.certifications && farmer.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    <Award className="h-4 w-4" />
                    {typeof cert === 'string' ? cert : cert.name || 'Certified'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-coffee-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {farmer.phone && (
                    <p className="text-coffee-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {farmer.phone}
                    </p>
                  )}
                  {farmer.email && (
                    <p className="text-coffee-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {farmer.email}
                    </p>
                  )}
                  {farmer.cooperative && (
                    <p className="text-coffee-600">
                      <span className="font-medium">Cooperative:</span> {farmer.cooperative.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div>
                <h3 className="text-lg font-bold text-coffee-900 mb-4">Farm Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  {farmer.farmSize && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <Leaf className="h-6 w-6 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-900">{farmer.farmSize}</p>
                      <p className="text-sm text-green-700">acres</p>
                    </div>
                  )}
                  {farmer.numberOfTrees && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <Trees className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{farmer.numberOfTrees.toLocaleString()}</p>
                      <p className="text-sm text-blue-700">Coffee Trees</p>
                    </div>
                  )}
                  {farmer.altitude && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <Mountain className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{farmer.altitude}m</p>
                      <p className="text-sm text-purple-700">Altitude</p>
                    </div>
                  )}
                  {farmer.totalYieldKg && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <Coffee className="h-6 w-6 text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">{(farmer.totalYieldKg / 1000).toFixed(1)}</p>
                      <p className="text-sm text-yellow-700">Tons Produced</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Location Map */}
        {(farmer.location || farmer.farmBoundary) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary-600" />
              Farm Location & Traceability
            </h2>
            <FarmMapPolygon 
              location={farmer.location}
              farmBoundary={farmer.farmBoundary}
              farmName={farmer.name}
              height="500px"
            />
          </div>
        )}

        {/* Farm Characteristics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Coffee Cultivation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
              <Coffee className="h-6 w-6 text-coffee-600" />
              Coffee Cultivation
            </h2>
            <div className="space-y-4">
              {farmer.primaryVariety && (
                <div>
                  <p className="text-sm text-coffee-600 mb-1">Primary Variety</p>
                  <p className="text-lg font-semibold text-coffee-900">{farmer.primaryVariety}</p>
                </div>
              )}
              {farmer.varieties && farmer.varieties.length > 0 && (
                <div>
                  <p className="text-sm text-coffee-600 mb-2">Coffee Varieties</p>
                  <div className="space-y-2">
                    {farmer.varieties.map((variety, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-coffee-900">{variety.name}</span>
                        <span className="text-coffee-600">{variety.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {farmer.plantingDensity && (
                <div>
                  <p className="text-sm text-coffee-600 mb-1">Planting Density</p>
                  <p className="text-coffee-900">{farmer.plantingDensity ? (farmer.plantingDensity / 2.47105).toFixed(0) : 0} trees/acre</p>
                </div>
              )}
              {farmer.shade && (
                <div>
                  <p className="text-sm text-coffee-600 mb-1">Shade Management</p>
                  <p className="text-coffee-900 capitalize">{farmer.shade.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
              <Mountain className="h-6 w-6 text-blue-600" />
              Environmental Conditions
            </h2>
            <div className="space-y-4">
              {farmer.soilType && (
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Soil Type</p>
                    <p className="text-coffee-900 capitalize">{farmer.soilType}</p>
                  </div>
                </div>
              )}
              {farmer.climateZone && (
                <div className="flex items-start gap-3">
                  <Sun className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Climate Zone</p>
                    <p className="text-coffee-900 capitalize">{farmer.climateZone}</p>
                  </div>
                </div>
              )}
              {farmer.rainfall?.annual && (
                <div className="flex items-start gap-3">
                  <Droplet className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-coffee-600">Annual Rainfall</p>
                    <p className="text-coffee-900">{farmer.rainfall.annual} mm</p>
                    {farmer.rainfall.pattern && (
                      <p className="text-sm text-coffee-600 capitalize">
                        {farmer.rainfall.pattern} pattern
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Farm Photos Gallery */}
        {farmer.photos && farmer.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-coffee-900 mb-6">Farm Gallery</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {farmer.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Farm photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 text-sm">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code & Traceability */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-coffee-900 mb-4">Farmer's Digital Story</h2>
            <p className="text-coffee-600 mb-6">
              Share this farmer's complete story and verified farm details with your customers. 
              Each scan shows authentic origin, quality standards, and sustainable practices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/marketplace/coffee"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                View Coffee Lots
              </Link>
              {farmerId && (
                <Link
                  href={`/tip/${farmerId}`}
                  className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <Heart className="h-5 w-5" />
                  Send a Tip
                </Link>
              )}
            </div>
          </div>
          
          {farmerId && (
            <TraceabilityQRCode 
              farmerId={farmerId}
              size={180}
              title="Farmer Profile QR"
              description="Share verified farmer story with buyers"
            />
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Support {farmer.name}</h2>
          <p className="mb-6 text-primary-100">
            Purchase their coffee or send a tip to support their sustainable farming practices
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/marketplace/coffee"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
            >
              Browse Coffee Lots
            </Link>
            {farmerId && (
              <Link
                href={`/tip/${farmerId}`}
                className="px-6 py-3 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-semibold flex items-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Send a Tip
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
