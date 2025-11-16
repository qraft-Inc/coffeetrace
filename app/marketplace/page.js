'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Filter, MapPin, Award, Leaf, TrendingUp, Package, Users, Grid, List } from 'lucide-react';
import { formatCurrency, formatWeight } from '@/lib/formatters';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
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
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Coffee Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover traceable, sustainable coffee directly from verified farmers and cooperatives
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Active Listings"
            value={pagination?.total || listings.length}
            icon={<Package className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            color="blue"
          />
          <StatCard
            title="Avg Quality Score"
            value="87.5"
            icon={<Award className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Verified Farmers"
            value="248"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
            color="purple"
          />
          <StatCard
            title="Avg Price/kg"
            value="$12.50"
            icon={<TrendingUp className="h-5 w-5" />}
            color="orange"
          />
        </div>

        {/* Search and View Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by variety, farmer, or location..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Variety
              </label>
              <select
                value={filters.variety}
                onChange={(e) => setFilters({ ...filters, variety: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Varieties</option>
                <option value="Arabica">Arabica</option>
                <option value="Robusta">Robusta</option>
                <option value="SL28">SL28</option>
                <option value="Geisha">Geisha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Quality Score
              </label>
              <input
                type="number"
                value={filters.minQuality}
                onChange={(e) => setFilters({ ...filters, minQuality: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                placeholder="0-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Price (per kg)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                placeholder="No limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Certification
              </label>
              <select
                value={filters.certification}
                onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
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
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Clear all filters
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">No listings found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-gray-100"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function ListingCard({ listing, viewMode }) {
  const lot = listing.lotId;
  const farmer = lot?.farmerId;

  if (viewMode === 'list') {
    return (
      <Link href={`/marketplace/${listing._id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center">
                <Award className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {lot?.variety || 'Coffee Lot'}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {farmer && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{farmer.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4" />
                    <span>{formatWeight(listing.availableQuantityKg)} available</span>
                  </div>

                  {lot?.qualityScore && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>Quality: {lot.qualityScore}/100</span>
                    </div>
                  )}
                </div>

                {farmer?.certifications && farmer.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {farmer.certifications.slice(0, 3).map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {formatCurrency(listing.pricePerKg, listing.currency)}/kg
              </div>
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/marketplace/${listing._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
          <Award className="h-16 w-16 text-primary-600 dark:text-primary-400 opacity-50" />
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {lot?.variety || 'Coffee Lot'}
            </h3>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(listing.pricePerKg, listing.currency)}/kg
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {farmer && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{farmer.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Leaf className="h-4 w-4" />
              <span>{formatWeight(listing.availableQuantityKg)} available</span>
            </div>

            {lot?.qualityScore && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Award className="h-4 w-4" />
                <span>Quality: {lot.qualityScore}/100</span>
              </div>
            )}
          </div>

          {farmer?.certifications && farmer.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {farmer.certifications.slice(0, 2).map((cert, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                >
                  {cert.name}
                </span>
              ))}
            </div>
          )}

          <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
