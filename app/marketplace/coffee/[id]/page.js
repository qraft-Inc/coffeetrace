'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Award, 
  Droplets, 
  Leaf, 
  Phone, 
  Mail, 
  MessageSquare, 
  Share2, 
  Heart,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function LotDetailPage({ params }) {
  const { id } = params;
  
  const [lot, setLot] = useState(null);
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchLotDetails();
  }, [id]);

  const fetchLotDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listing details
      const listingRes = await fetch(`/api/marketplace/${id}`, {
        cache: 'no-store',
      });

      if (!listingRes.ok) {
        throw new Error('Lot not found');
      }

      const listingData = await listingRes.json();
      setListing(listingData);

      // Extract lot ID from listing
      const lotId = listingData.lotId?._id || listingData.lotId;

      // Fetch lot details
      if (lotId) {
        const lotRes = await fetch(`/api/lots/${lotId}`, {
          cache: 'no-store',
        });

        if (lotRes.ok) {
          const lotData = await lotRes.json();
          setLot(lotData);

          // Fetch farmer details
          if (lotData.farmerId?._id || lotData.farmerId) {
            const farmerId = lotData.farmerId?._id || lotData.farmerId;
            const farmerRes = await fetch(`/api/farmers/${farmerId}`, {
              cache: 'no-store',
            });
            if (farmerRes.ok) {
              const farmerData = await farmerRes.json();
              setFarmer(farmerData);
            }
          }

          // Fetch cooperative details if available
          if (lotData.cooperativeId?._id || lotData.cooperativeId) {
            const coopId = lotData.cooperativeId?._id || lotData.cooperativeId;
            const coopRes = await fetch(`/api/cooperatives/${coopId}`, {
              cache: 'no-store',
            });
            if (coopRes.ok) {
              const coopData = await coopRes.json();
              setCooperative(coopData);
            }
          }
        }
      }

      // Fetch seller details
      if (listingData.sellerId?._id || listingData.sellerId) {
        const sellerId = listingData.sellerId?._id || listingData.sellerId;
        const sellerRes = await fetch(`/api/users/${sellerId}`, {
          cache: 'no-store',
        });
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSeller(sellerData);
        }
      }
    } catch (error) {
      console.error('Error fetching lot details:', error);
      setError(error.message || 'Failed to load lot details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-coffee-600">Loading lot details...</p>
        </div>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen bg-coffee-50 pt-32">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 text-center border border-red-200 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-coffee-900 mb-2">Lot Not Found</h2>
            <p className="text-coffee-600 mb-6">{error || 'This lot is no longer available'}</p>
            <Link
              href="/marketplace?tab=coffee"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Lots
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const computeGrade = (qualityScore) => {
    if (!qualityScore) return 'N/A';
    if (qualityScore >= 87) return 'AA';
    if (qualityScore >= 75) return 'A';
    if (qualityScore >= 60) return 'B';
    return 'C';
  };

  const tracePhotos = lot.events?.filter(e => e.photoUrl).map(e => e.photoUrl) || [];
  const allPhotos = tracePhotos.length > 0 ? tracePhotos : ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'];

  const sellerName = farmer?.name || cooperative?.name || seller?.name || 'Unknown Seller';
  const sellerLocation = farmer?.cooperativeId ? cooperative?.address?.city : cooperative?.address?.city;
  const sellerPhone = farmer?.phone || cooperative?.phone;
  const sellerEmail = farmer?.email || cooperative?.email;
  const harvestDateFormatted = lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const postedDateFormatted = listing?.postedAt ? new Date(listing.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Recently';

  return (
    <div className="px-6 sm:px-8 lg:px-10 pt-6 pb-16">
      {/* Save & Share Actions */}
      <div className="mb-6 flex justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-red-100 text-red-600'
                : 'text-coffee-600 hover:bg-coffee-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 text-coffee-600 hover:bg-coffee-100 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6 pb-4 border-b border-coffee-200">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700">Marketplace</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <Link href="/marketplace?tab=coffee" className="text-primary-600 hover:text-primary-700">Coffee Lots</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <span className="text-coffee-900 font-medium truncate">{lot?.variety || 'Lot Details'}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Gallery & Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-coffee-200">
              <div className="relative h-80 sm:h-96 lg:h-[32rem] bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center overflow-hidden">
                <Image
                  src={allPhotos[selectedImage]}
                  alt={`${lot.variety} coffee lot`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
                  }}
                />
              </div>

              {/* Thumbnail Gallery */}
              {allPhotos.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-coffee-50">
                  {allPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-primary-600'
                          : 'border-coffee-300 hover:border-primary-400'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lot Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-coffee-900 mb-2">
                    {lot.variety} Coffee
                  </h1>
                  <p className="text-coffee-600">
                    Lot ID: {lot.traceId}
                  </p>
                </div>
                {lot.qualityScore && (
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary-600">
                      {computeGrade(lot.qualityScore)}
                    </div>
                    <p className="text-sm text-coffee-600">Grade</p>
                    <div className="text-sm text-coffee-700 font-medium mt-2">
                      {lot.qualityScore.toFixed(1)}/100
                    </div>
                  </div>
                )}
              </div>

              {/* Key Specs Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg h-fit">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-coffee-600 uppercase font-bold">Harvest Date</p>
                    <p className="text-sm font-semibold text-coffee-900">{harvestDateFormatted}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-3 bg-green-100 rounded-lg h-fit">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-coffee-600 uppercase font-bold">Processing</p>
                    <p className="text-sm font-semibold text-coffee-900 capitalize">
                      {lot.processingMethod?.replace('-', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg h-fit">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-coffee-600 uppercase font-bold">Moisture</p>
                    <p className="text-sm font-semibold text-coffee-900">
                      {lot.moisture ? `${lot.moisture.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg h-fit">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-coffee-600 uppercase font-bold">Quality Score</p>
                    <p className="text-sm font-semibold text-coffee-900">
                      {lot.qualityScore ? `${lot.qualityScore.toFixed(1)}/100` : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing?.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
                <h3 className="text-lg font-bold text-coffee-900 mb-3">About This Lot</h3>
                <p className="text-coffee-700 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Trace Events */}
            {lot.events && lot.events.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
                <h3 className="text-lg font-bold text-coffee-900 mb-4">Traceability Timeline</h3>
                <div className="space-y-4">
                  {lot.events.slice().reverse().map((event, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-coffee-100 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary-600 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-coffee-900 capitalize">{event.step}</p>
                          <span className="text-xs text-coffee-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {event.note && (
                          <p className="text-sm text-coffee-600 mt-1">{event.note}</p>
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
            )}
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200 sticky top-20">
              <div className="mb-6">
                <p className="text-xs text-coffee-600 uppercase font-bold mb-1">Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatCurrency(listing?.pricePerKg || 0)}
                  </span>
                  <span className="text-lg text-coffee-600">/kg</span>
                </div>
                <p className="text-sm text-coffee-500 mt-2">
                  Currency: {listing?.currency || 'USD'}
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-coffee-200">
                <div className="flex justify-between">
                  <span className="text-coffee-600">Total Quantity:</span>
                  <strong className="text-coffee-900">{lot.quantityKg} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-coffee-600">Available:</span>
                  <strong className="text-coffee-900">{listing?.availableQuantityKg || 0} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-coffee-600">Minimum Order:</span>
                  <strong className="text-coffee-900">{listing?.minQuantityKg || 1} kg</strong>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  {listing?.status === 'open' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Available</span>
                    </>
                  ) : listing?.status === 'under_offer' ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">Under Offer</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">Sold</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-coffee-500 mt-2">
                  Posted {postedDateFormatted}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  disabled={listing?.status !== 'open'}
                  className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
                </button>
                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Seller
                </button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
              <h4 className="text-sm font-bold text-coffee-600 uppercase tracking-widest mb-4">Seller</h4>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {sellerName?.[0] || '?'}
                  </span>
                </div>
                <h5 className="text-lg font-bold text-coffee-900">{sellerName}</h5>
                {sellerLocation && (
                  <p className="text-sm text-coffee-600 flex items-center justify-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {sellerLocation}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="flex items-center gap-3 p-3 hover:bg-coffee-50 rounded-lg transition-colors"
                  >
                    <Phone className="h-5 w-5 text-coffee-600 flex-shrink-0" />
                    <span className="text-sm text-coffee-700">{sellerPhone}</span>
                  </a>
                )}
                {sellerEmail && (
                  <a
                    href={`mailto:${sellerEmail}`}
                    className="flex items-center gap-3 p-3 hover:bg-coffee-50 rounded-lg transition-colors"
                  >
                    <Mail className="h-5 w-5 text-coffee-600 flex-shrink-0" />
                    <span className="text-sm text-coffee-700 truncate">{sellerEmail}</span>
                  </a>
                )}
              </div>

              {/* Certifications */}
              {cooperative?.certifications && cooperative.certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-coffee-200">
                  <p className="text-xs font-bold text-coffee-600 uppercase tracking-widest mb-3">Certifications</p>
                  <div className="space-y-2">
                    {cooperative.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-coffee-700">{cert.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
