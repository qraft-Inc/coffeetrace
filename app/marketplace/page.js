'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coffee, Sprout, Package, Grid3x3, List, MapPin, Award, Filter, X } from 'lucide-react';
import { formatCurrency, formatWeight } from '@/lib/formatters';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('coffee');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('newest');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    variety: '',
    minQuality: 0,
    maxPrice: '',
    certification: '',
  });

  useEffect(() => {
    fetchListings();
  }, [activeTab, filters, page, sort]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sortBy: 'postedAt',
        sortOrder: sort === 'lowest' ? 'asc' : 'desc',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== 0)
        ),
      });

      const endpoint = activeTab === 'coffee' 
        ? '/api/marketplace'
        : activeTab === 'agro'
        ? '/api/agro-inputs'
        : '/api/products';

      const res = await fetch(`${endpoint}?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setListings(data.listings || data.items || data.products || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeGrade = (qualityScore) => {
    if (!qualityScore) return 'N/A';
    if (qualityScore >= 87) return 'AA';
    if (qualityScore >= 75) return 'A';
    if (qualityScore >= 60) return 'B';
    return 'C';
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm border-b border-coffee-200">
        <div className="w-full">
          {/* Header top row: Logo + CTA buttons */}
          <div className="flex justify-between items-center h-14 sm:h-16 px-6 sm:px-8 lg:px-10">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="https://res.cloudinary.com/ddew8kfxf/image/upload/v1763059666/Coffee_Trap_Mix_ky8mwv.png"
                alt="Coffee Trace Logo"
                width={32}
                height={32}
                className="object-contain sm:w-10 sm:h-10"
              />
              <span className="text-lg sm:text-2xl font-bold text-coffee-900">Coffee Trace</span>
            </Link>

            <div className="flex gap-2 sm:gap-3 items-center">
              <Link
                href="/auth/signin"
                className="hidden sm:block px-3 lg:px-4 py-2 text-sm text-coffee-900 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="w-full pt-16">
        <div className="w-full">
          <div className="flex gap-0 min-h-screen">
            {/* SIDEBAR - Desktop only */}
            <aside className="hidden lg:w-80 lg:flex flex-col flex-shrink-0 bg-white border-r border-coffee-200">
              <div className="p-8">
                {/* Marketplace Label */}
                <h1 className="text-xs font-bold uppercase tracking-widest text-coffee-600 mb-8">Marketplace</h1>

                {/* Category Menu */}
                <div className="mb-10">
                  <div className="space-y-2">
                    <button
                      onClick={() => { setActiveTab('coffee'); setPage(1); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'coffee'
                          ? 'bg-primary-100 text-primary-600 font-semibold'
                          : 'text-coffee-700 hover:bg-coffee-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coffee className="h-5 w-5" />
                        <span>Coffee lots</span>
                      </div>
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        activeTab === 'coffee'
                          ? 'bg-primary-600 text-white'
                          : 'bg-coffee-200 text-coffee-700'
                      }`}>
                        {listings.length}
                      </span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('agro'); setPage(1); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'agro'
                          ? 'bg-primary-100 text-primary-600 font-semibold'
                          : 'text-coffee-700 hover:bg-coffee-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sprout className="h-5 w-5" />
                        <span>Agro-Inputs</span>
                      </div>
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        activeTab === 'agro'
                          ? 'bg-primary-600 text-white'
                          : 'bg-coffee-200 text-coffee-700'
                      }`}>
                        15
                      </span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('products'); setPage(1); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'products'
                          ? 'bg-primary-100 text-primary-600 font-semibold'
                          : 'text-coffee-700 hover:bg-coffee-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5" />
                        <span>Products</span>
                      </div>
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        activeTab === 'products'
                          ? 'bg-primary-600 text-white'
                          : 'bg-coffee-200 text-coffee-700'
                      }`}>
                        9
                      </span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-coffee-200 mb-8"></div>

                {/* Filters Header */}
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Filter className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-coffee-600">Filters</h2>
                </div>

                {/* Coffee Filters */}
                {activeTab === 'coffee' && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Variety</label>
                      <select
                        value={filters.variety}
                        onChange={(e) => { setFilters({ ...filters, variety: e.target.value }); setPage(1); }}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                      >
                        <option value="">All Varieties</option>
                        <option value="Arabica">Arabica</option>
                        <option value="Robusta">Robusta</option>
                        <option value="SL28">SL28</option>
                        <option value="Geisha">Geisha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Quality Score</label>
                      <input
                        type="number"
                        value={filters.minQuality}
                        onChange={(e) => { setFilters({ ...filters, minQuality: parseFloat(e.target.value) || 0 }); setPage(1); }}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 placeholder-coffee-500 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        placeholder="Minimum: 0-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Max Price / kg</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => { setFilters({ ...filters, maxPrice: e.target.value }); setPage(1); }}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 placeholder-coffee-500 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                        placeholder="No limit"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Certification</label>
                      <select
                        value={filters.certification}
                        onChange={(e) => { setFilters({ ...filters, certification: e.target.value }); setPage(1); }}
                        className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                      >
                        <option value="">Any Certification</option>
                        <option value="organic">Organic Certified</option>
                        <option value="fair trade">Fair Trade</option>
                        <option value="rainforest">Rainforest Alliance</option>
                      </select>
                    </div>

                    <div className="h-px bg-coffee-200"></div>

                    <button
                      onClick={() => { setFilters({ variety: '', minQuality: 0, maxPrice: '', certification: '' }); setPage(1); }}
                      className="w-full px-4 py-3 bg-coffee-100 hover:bg-coffee-200 text-coffee-900 font-semibold rounded-lg transition-all text-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {activeTab === 'agro' && (
                  <div className="text-center py-8">
                    <p className="text-coffee-600 text-sm">Filters coming soon for Agro-Inputs</p>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="text-center py-8">
                    <p className="text-coffee-600 text-sm">Filters coming soon for Products</p>
                  </div>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 px-6 sm:px-8 lg:px-10 pt-6">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              {/* Mobile Filter Drawer */}
              {mobileFilterOpen && (
                <div className="fixed inset-0 z-30 lg:hidden pt-32">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
                  <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-coffee-900">Filters</h2>
                      <button onClick={() => setMobileFilterOpen(false)} className="p-1 hover:bg-coffee-100 rounded">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {activeTab === 'coffee' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Variety</label>
                          <select
                            value={filters.variety}
                            onChange={(e) => { setFilters({ ...filters, variety: e.target.value }); setPage(1); }}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          >
                            <option value="">All Varieties</option>
                            <option value="Arabica">Arabica</option>
                            <option value="Robusta">Robusta</option>
                            <option value="SL28">SL28</option>
                            <option value="Geisha">Geisha</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Min Quality Score</label>
                          <input
                            type="number"
                            value={filters.minQuality}
                            onChange={(e) => { setFilters({ ...filters, minQuality: parseFloat(e.target.value) || 0 }); setPage(1); }}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            placeholder="0-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Max Price (per kg)</label>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => { setFilters({ ...filters, maxPrice: e.target.value }); setPage(1); }}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            placeholder="No limit"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Certification</label>
                          <select
                            value={filters.certification}
                            onChange={(e) => { setFilters({ ...filters, certification: e.target.value }); setPage(1); }}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          >
                            <option value="">Any Certification</option>
                            <option value="organic">Organic Certified</option>
                            <option value="fair trade">Fair Trade</option>
                            <option value="rainforest">Rainforest Alliance</option>
                          </select>
                        </div>

                        <button
                          onClick={() => { setFilters({ variety: '', minQuality: 0, maxPrice: '', certification: '' }); setPage(1); }}
                          className="w-full px-3 py-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-900 font-semibold rounded-lg transition-all text-sm"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-4 py-2 border border-coffee-300 rounded-lg text-sm text-coffee-900 bg-white hover:border-coffee-400 focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-coffee-600 hover:bg-coffee-100'}`}
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-100 text-primary-600' : 'text-coffee-600 hover:bg-coffee-100'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`p-2 rounded-lg transition-colors ${view === 'map' ? 'bg-primary-100 text-primary-600' : 'text-coffee-600 hover:bg-coffee-100'}`}
                  >
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Listings */}
              {loading ? (
                <div className="bg-white p-12 rounded-lg text-center border border-coffee-200">
                  <p className="text-coffee-600">Loading {activeTab === 'coffee' ? 'coffee lots' : activeTab === 'agro' ? 'agro-inputs' : 'products'}...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white p-12 rounded-lg text-center border border-coffee-200">
                  <p className="text-coffee-600">No {activeTab === 'coffee' ? 'coffee lots' : activeTab === 'agro' ? 'agro products' : 'products'} found matching your filters.</p>
                </div>
              ) : view === 'grid' ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {listings.map((item) => (
                      <ListingCard key={item._id} listing={item} type={activeTab} computeGrade={computeGrade} />
                    ))}
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <div className="mt-10">
                      {/* Showing info on left */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-coffee-600">
                          Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, pagination.total || page * 6)} of {pagination.total || page * 12} lots
                        </span>
                      </div>
                      
                      {/* Pagination controls centered */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-3 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 text-sm font-medium"
                        >
                          Prev
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex gap-1">
                          {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                disabled={pageNum > pagination.pages}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                  page === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'border border-coffee-300 text-coffee-600 hover:bg-coffee-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          {pagination.pages > 5 && <span className="px-2 text-coffee-400">...</span>}
                        </div>
                        
                        <button
                          onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                          disabled={page === pagination.pages}
                          className="px-3 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : view === 'list' ? (
                <>
                  <div className="space-y-4 max-w-4xl">
                    {listings.map((item) => (
                      <ListingListItem key={item._id} listing={item} type={activeTab} computeGrade={computeGrade} />
                    ))}
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 text-sm font-medium"
                      >
                        Previous
                      </button>
                      <span className="text-base font-bold text-coffee-900">{page}/{pagination.pages}</span>
                      <button
                        onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 text-sm font-medium"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white p-12 rounded-lg text-center border border-coffee-200">
                  <MapPin className="h-12 w-12 text-coffee-400 mx-auto mb-4" />
                  <p className="text-coffee-600 mb-2">Map view coming soon</p>
                  <p className="text-sm text-coffee-500">Locations will be displayed on an interactive map</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing, type, computeGrade }) {
  const lot = listing.lotId || listing;
  const farmer = lot?.farmerId;
  const hasGps = lot?.gps?.coordinates && lot.gps.coordinates.length === 2;

  if (type === 'agro') {
    return (
      <Link href={`/marketplace/agro/${listing._id}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-coffee-200 hover:border-primary-600">
          <div className="h-32 bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center">
            <Sprout className="h-16 w-16 text-white opacity-50" />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-coffee-900 truncate">{listing.name || listing.category}</h3>
            <p className="text-xs text-coffee-600 mb-3">{listing.category}</p>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-primary-600">
                  {listing.price?.amount && formatCurrency(listing.price.amount)}
                </span>
                <span className="text-xs text-coffee-600">/{listing.price?.unit || 'unit'}</span>
              </div>
              {listing.stock?.quantity && (
                <div className="text-xs text-coffee-600">{listing.stock.quantity} {listing.stock.unit || 'units'}</div>
              )}
            </div>
            <button className="w-full py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium">
              View Details
            </button>
          </div>
        </div>
      </Link>
    );
  }

  if (type === 'products') {
    return (
      <Link href={`/marketplace/products/${listing._id}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-coffee-200 hover:border-primary-600">
          <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <Package className="h-16 w-16 text-white opacity-50" />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-coffee-900 truncate">{listing.name}</h3>
            <p className="text-xs text-coffee-600 mb-3">{listing.category}</p>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-primary-600">
                  {listing.price && formatCurrency(listing.price)}
                </span>
              </div>
              {listing.weight && (
                <div className="text-xs text-coffee-600">{formatWeight(listing.weight)}</div>
              )}
            </div>
            <button className="w-full py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium">
              View Details
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Coffee lots
  return (
    <Link href={`/marketplace/${listing._id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-coffee-200 hover:border-primary-600">
        <div className="relative h-32 flex items-center justify-center overflow-hidden" 
          style={{
            backgroundColor: lot?.region === 'Mt. Elgon' ? '#4a7c59' : 
                            lot?.region === 'Fort Portal' ? '#9b7653' :
                            lot?.region === 'Rwenzori' ? '#7a5a3a' :
                            lot?.region === 'Kibale' ? '#6b8e23' :
                            '#a68968'
          }}>
          
          {hasGps && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm">
              <Award className="h-3 w-3" />
              GPS Verified
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-coffee-900 flex-1 truncate">{lot?.variety || 'Coffee Lot'}</h3>
            {lot?.gradeScore && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded">
                {computeGrade(lot.gradeScore)}
              </span>
            )}
          </div>

          <p className="text-xs text-coffee-600 mb-2 truncate">{farmer?.farmerName || 'Private Seller'}</p>

          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold text-primary-600">
                {lot?.pricePerKg && formatCurrency(lot.pricePerKg)}
              </span>
              <span className="text-xs text-coffee-600">/kg</span>
            </div>
            {lot?.availableQuantity && (
              <div className="text-xs text-coffee-600">{lot.availableQuantity}kg</div>
            )}
          </div>

          <button className="w-full py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

function ListingListItem({ listing, type, computeGrade }) {
  const lot = listing.lotId || listing;

  return (
    <Link href={`/marketplace/${listing._id}`}>
      <div className="bg-white rounded-lg border border-coffee-200 hover:border-primary-600 hover:shadow-md transition-all p-4 flex gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-300 rounded-lg flex-shrink-0 flex items-center justify-center">
          {type === 'coffee' ? (
            <Coffee className="h-10 w-10 text-white opacity-40" />
          ) : type === 'agro' ? (
            <Sprout className="h-10 w-10 text-white opacity-40" />
          ) : (
            <Package className="h-10 w-10 text-white opacity-40" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-coffee-900">{lot?.variety || listing.name}</h3>
          <p className="text-sm text-coffee-600">{listing.category || lot?.region}</p>

          {type === 'coffee' && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-lg font-bold text-primary-600">
                {lot?.pricePerKg && formatCurrency(lot.pricePerKg)}/kg
              </span>
              {lot?.gradeScore && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded">
                  {computeGrade(lot.gradeScore)}
                </span>
              )}
            </div>
          )}

          {type !== 'coffee' && (
            <span className="text-lg font-bold text-primary-600 block mt-2">
              {listing.price && formatCurrency(listing.price)}
            </span>
          )}
        </div>

        <button className="self-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
          View
        </button>
      </div>
    </Link>
  );
}
