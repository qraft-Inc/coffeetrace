'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Phone, Mail, MessageSquare, Share2, Heart, CheckCircle, AlertCircle, Loader, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function ProductDetailPage({ params }) {
  const router = useRouter();
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

      const res = await fetch(`/api/products/${id}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Product not found');
      }

      const data = await res.json();
      setItem(data);
      setSeller(data.seller || { name: 'Seller' });
    } catch (error) {
      console.error('Error fetching details:', error);
      setError(error.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-coffee-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="pt-8 px-6 sm:px-8 lg:px-10">
        <div className="bg-white rounded-lg p-8 text-center border border-red-200 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-coffee-900 mb-2">Product Not Found</h2>
          <p className="text-coffee-600 mb-6">{error || 'This product is no longer available'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-8 lg:px-10 pt-6 pb-16">
      {/* Back Button & Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 text-coffee-700 hover:bg-coffee-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
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
          <Link href="/" className="text-primary-600 hover:text-primary-700">Home</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700">Marketplace</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <Link href="/marketplace?tab=products" className="text-primary-600 hover:text-primary-700">Products</Link>
          <ChevronRight className="h-4 w-4 text-coffee-400" />
          <span className="text-coffee-900 font-medium truncate">{item?.name || 'Loading...'}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-coffee-200">
            <div className="relative h-80 sm:h-96 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <Package className="h-24 w-24 text-white opacity-30" />
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
            <h1 className="text-3xl sm:text-4xl font-bold text-coffee-900 mb-4">{item?.name}</h1>
            <p className="text-coffee-600 mb-2">{item?.category}</p>
            
            {item?.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-coffee-900 mb-2">Description</h3>
                <p className="text-coffee-700">{item.description}</p>
              </div>
            )}

            {item?.specifications && (
              <div className="mt-6">
                <h3 className="font-semibold text-coffee-900 mb-3">Specifications</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {Object.entries(item.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-coffee-600">{key}:</span>
                      <span className="font-medium text-coffee-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Pricing & CTA */}
        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200 sticky top-24">
            <div className="mb-6">
              <p className="text-xs text-coffee-600 uppercase font-bold mb-1">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary-600">
                  {item?.price ? formatCurrency(item.price) : 'N/A'}
                </span>
              </div>
            </div>

            {item?.stock && (
              <div className="space-y-3 mb-6 pb-6 border-b border-coffee-200">
                <div className="flex justify-between">
                  <span className="text-coffee-600">Available:</span>
                  <strong className="text-coffee-900">{item.stock?.quantity || 0} {item.stock?.unit || 'units'}</strong>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">In Stock</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors">
                Add to Cart
              </button>
              <button className="w-full py-3 border-2 border-primary-600 text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Seller
              </button>
            </div>
          </div>

          {/* Seller Card */}
          {seller && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
              <h4 className="text-sm font-bold text-coffee-600 uppercase tracking-widest mb-4">Seller</h4>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">
                    {seller.name?.[0] || 'S'}
                  </span>
                </div>
                <h5 className="text-lg font-bold text-coffee-900">{seller.name || 'Seller'}</h5>
              </div>

              <div className="space-y-3">
                {seller.phone && (
                  <a href={`tel:${seller.phone}`} className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg transition-colors">
                    <Phone className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-coffee-700">{seller.phone}</span>
                  </a>
                )}
                {seller.email && (
                  <a href={`mailto:${seller.email}`} className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-lg transition-colors">
                    <Mail className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-coffee-700 truncate">{seller.email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
