'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Award, Leaf } from 'lucide-react';
import { formatCurrency, formatWeight } from '@/lib/formatters';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    variety: '',
    minQuality: 0,
    maxPrice: '',
    certification: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [filters, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== 0)
        ),
      });

      const res = await fetch(`/api/marketplace?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setListings(data.listings);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-coffee-800">
              Coffee Trace
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-coffee-700 hover:text-coffee-900">
                Dashboard
              </Link>
              <Link href="/auth/signin" className="text-coffee-700 hover:text-coffee-900">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">
            Coffee Marketplace
          </h1>
          <p className="text-coffee-600">
            Discover traceable, sustainable coffee directly from verified farmers and cooperatives
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-coffee-600" />
            <h2 className="text-lg font-semibold text-coffee-900">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">
                Variety
              </label>
              <select
                value={filters.variety}
                onChange={(e) => setFilters({ ...filters, variety: e.target.value })}
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Varieties</option>
                <option value="Arabica">Arabica</option>
                <option value="Robusta">Robusta</option>
                <option value="SL28">SL28</option>
                <option value="Geisha">Geisha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">
                Min Quality Score
              </label>
              <input
                type="number"
                value={filters.minQuality}
                onChange={(e) => setFilters({ ...filters, minQuality: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">
                Max Price (per kg)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="No limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1">
                Certification
              </label>
              <select
                value={filters.certification}
                onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="organic">Organic</option>
                <option value="fair trade">Fair Trade</option>
                <option value="rainforest">Rainforest Alliance</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setFilters({ variety: '', minQuality: 0, maxPrice: '', certification: '' })}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all filters
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-coffee-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center">
            <p className="text-coffee-600">No listings found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-coffee-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const lot = listing.lotId;
  const farmer = lot?.farmerId;

  return (
    <Link href={`/marketplace/${listing._id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-400 flex items-center justify-center">
          <Award className="h-16 w-16 text-white opacity-50" />
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-coffee-900">
              {lot?.variety || 'Coffee Lot'}
            </h3>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(listing.pricePerKg, listing.currency)}/kg
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {farmer && (
              <div className="flex items-center gap-2 text-sm text-coffee-600">
                <MapPin className="h-4 w-4" />
                <span>{farmer.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-coffee-600">
              <Leaf className="h-4 w-4" />
              <span>{formatWeight(listing.availableQuantityKg)} available</span>
            </div>

            {lot?.qualityScore && (
              <div className="flex items-center gap-2 text-sm text-coffee-600">
                <Award className="h-4 w-4" />
                <span>Quality: {lot.qualityScore}/100</span>
              </div>
            )}
          </div>

          {farmer?.certifications && farmer.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {farmer.certifications.slice(0, 2).map((cert, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                >
                  {cert.name}
                </span>
              ))}
            </div>
          )}

          <button className="mt-4 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
