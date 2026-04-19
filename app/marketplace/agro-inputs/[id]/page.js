'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Phone, Mail, MessageSquare, Share2, Heart, CheckCircle, AlertCircle, Loader, Sprout } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function AgroDetailPage({ params }) {
  const { id } = params;
  
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/agro-inputs/${id}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Item not found');
      }

      const data = await res.json();
      setItem(data);
      setSeller(data.seller || { name: 'Supplier' });
    } catch (error) {
      console.error('Error fetching details:', error);
      setError(error.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-coffee-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="pt-8 px-6 sm:px-8 lg:px-10">
        <div className="bg-white rounded-lg p-8 text-center border border-red-200 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-coffee-900 mb-2">Item Not Found</h2>
          <p className="text-coffee-600 mb-6">{error || 'This item is no longer available'}</p>
          <Link
            href="/marketplace?tab=agro"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

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
      <div className="mb-8 pb-4 border-b border-coffee-200">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700">Marketplace</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <Link href="/marketplace?tab=agro" className="text-primary-600 hover:text-primary-700">Agro-Inputs</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <span className="text-coffee-900 font-medium truncate">{item?.name || 'Item Details'}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-sm border border-coffee-100 overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              {item?.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sprout className="h-32 w-32 text-green-300" />
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-coffee-100 p-6">
            <h1 className="text-3xl font-bold text-coffee-900 mb-4">{item?.name}</h1>

            {/* Product Info */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-coffee-600 mb-1">Category</p>
                <p className="font-semibold text-coffee-900">{item?.category || 'Agro-Input'}</p>
              </div>
              <div>
                <p className="text-sm text-coffee-600 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <p className="font-semibold text-coffee-900">{item?.status || 'Available'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {item?.description && (
              <div className="mb-6">
                <p className="text-coffee-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              {item?.specifications?.brand && (
                <div className="p-4 bg-coffee-50 rounded-lg">
                  <p className="text-xs text-coffee-600 mb-1">Brand</p>
                  <p className="font-semibold text-coffee-900">{item.specifications.brand}</p>
                </div>
              )}
              {item?.specifications?.unit && (
                <div className="p-4 bg-coffee-50 rounded-lg">
                  <p className="text-xs text-coffee-600 mb-1">Unit</p>
                  <p className="font-semibold text-coffee-900">{item.specifications.unit}</p>
                </div>
              )}
              {item?.specifications?.composition && (
                <div className="p-4 bg-coffee-50 rounded-lg col-span-2">
                  <p className="text-xs text-coffee-600 mb-1">Composition</p>
                  <p className="font-semibold text-coffee-900">{item.specifications.composition}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          {/* Price Card */}
          <div className="bg-white rounded-lg shadow-sm border border-coffee-100 p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-sm text-coffee-600 mb-2">Price</p>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(item?.price || 0)}</p>
              <p className="text-sm text-coffee-600 mt-2">per {item?.unit || 'unit'}</p>
            </div>

            {/* Availability */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-coffee-900">In Stock</p>
              </div>
              <p className="text-sm text-coffee-600">{item?.stock || 'Available'}</p>
            </div>

            {/* Contact Actions */}
            <div className="space-y-2">
              <button className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Send Inquiry
              </button>
              <button className="w-full py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Call Supplier
              </button>
            </div>
          </div>

          {/* Seller Card */}
          {seller && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-coffee-100 p-6">
              <h3 className="font-semibold text-coffee-900 mb-4">Supplier</h3>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-coffee-900">{seller.name}</p>
                  {seller.phone && (
                    <p className="text-sm text-coffee-600 flex items-center gap-1 mt-2">
                      <Phone className="h-4 w-4" /> {seller.phone}
                    </p>
                  )}
                  {seller.email && (
                    <p className="text-sm text-coffee-600 flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4" /> {seller.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
