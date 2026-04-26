'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Coffee, Sprout, Package, Grid3x3, List, MapPin, Filter, X } from 'lucide-react';
import { formatCurrency, formatWeight } from '@/lib/formatters';

function MarketplacePageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'coffee';
  const variety = searchParams.get('variety') || '';
  const minQuality = searchParams.get('minQuality') ? parseFloat(searchParams.get('minQuality')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : '';
  const certification = searchParams.get('certification') || '';

  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('newest');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [tab, variety, minQuality, maxPrice, certification, page, sort]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sortBy: 'postedAt',
        sortOrder: sort === 'lowest' ? 'asc' : 'desc',
      });

      if (variety) params.set('variety', variety);
      if (minQuality > 0) params.set('minQuality', minQuality.toString());
      if (maxPrice) params.set('maxPrice', maxPrice.toString());
      if (certification) params.set('certification', certification);

      const endpoint = tab === 'coffee' 
        ? '/api/marketplace'
        : tab === 'agro'
        ? '/api/agro-inputs'
        : '/api/products';

      const res = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error || 'Failed to fetch listings');
      }

      setListings(data.listings || data.items || data.products || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setError(error.message || 'Failed to load listings. Please try again.');
      setListings([]);
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
    <div className="px-6 sm:px-8 lg:px-10 pt-6 pb-16">
      {/* Mobile category tabs */}
              <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => { /* update tab via URL */ }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    tab === 'coffee'
                      ? 'bg-primary-600 text-white'
                      : 'bg-coffee-100 text-coffee-900 hover:bg-coffee-200'
                  }`}
                >
                  <Coffee className="h-4 w-4" />
                  Coffee lots
                </button>
                <button
                  onClick={() => { /* update tab via URL */ }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    tab === 'agro'
                      ? 'bg-primary-600 text-white'
                      : 'bg-coffee-100 text-coffee-900 hover:bg-coffee-200'
                  }`}
                >
                  <Sprout className="h-4 w-4" />
                  Agro-Inputs
                </button>
                <button
                  onClick={() => { /* update tab via URL */ }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    tab === 'products'
                      ? 'bg-primary-600 text-white'
                      : 'bg-coffee-100 text-coffee-900 hover:bg-coffee-200'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Products
                </button>
              </div>

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

                    {tab === 'coffee' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Variety</label>
                          <select
                            value={variety}
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
                            value={minQuality}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            placeholder="0-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Max Price (per kg)</label>
                          <input
                            type="number"
                            value={maxPrice}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            placeholder="No limit"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-2">Certification</label>
                          <select
                            value={certification}
                            className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          >
                            <option value="">Any Certification</option>
                            <option value="organic">Organic Certified</option>
                            <option value="fair trade">Fair Trade</option>
                            <option value="rainforest">Rainforest Alliance</option>
                          </select>
                        </div>
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
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <p className="text-red-800 font-medium mb-2">Failed to load {tab === 'coffee' ? 'coffee lots' : tab === 'agro' ? 'agro-inputs' : 'products'}</p>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchListings}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loading ? (
                <div className="bg-white p-8 sm:p-12 rounded-lg text-center border border-coffee-200">
                  <div className="inline-block animate-spin mb-4">
                    <Coffee className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-coffee-600">Loading {tab === 'coffee' ? 'coffee lots' : tab === 'agro' ? 'agro-inputs' : 'products'}...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white p-8 sm:p-12 rounded-lg text-center border border-coffee-200">
                  <Coffee className="h-12 w-12 text-coffee-400 mx-auto mb-4" />
                  <p className="text-coffee-600 font-medium mb-2">No {tab === 'coffee' ? 'coffee lots' : tab === 'agro' ? 'agro products' : 'products'} found</p>
                  <p className="text-sm text-coffee-500">No {tab === 'coffee' ? 'coffee lots' : tab === 'agro' ? 'agro products' : 'products'} matching your filters. Try adjusting your search.</p>
                </div>
              ) : view === 'grid' ? (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {listings.map((item) => (
                      <ListingCard key={item._id} listing={item} type={tab} computeGrade={computeGrade} />
                    ))}
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <div className="mt-10">
                      {/* Showing info on left */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs sm:text-sm text-coffee-600">
                          Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, pagination.total || page * 6)} of {pagination.total || page * 12}
                        </span>
                      </div>
                      
                      {/* Pagination controls centered */}
                      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-2 sm:px-3 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                        >
                          Prev
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex gap-0.5 sm:gap-1">
                          {[...Array(Math.min(3, pagination.pages))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                disabled={pageNum > pagination.pages}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                  page === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'border border-coffee-300 text-coffee-600 hover:bg-coffee-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          {pagination.pages > 3 && <span className="px-1 sm:px-2 text-coffee-400 text-xs sm:text-sm">...</span>}
                        </div>
                        
                        <button
                          onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                          disabled={page === pagination.pages}
                          className="px-2 sm:px-3 py-2 border border-coffee-300 rounded-lg hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
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
                      <ListingListItem key={item._id} listing={item} type={tab} computeGrade={computeGrade} />
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
            </div>
  );
}

        export default function MarketplacePage() {
          return (
            <Suspense fallback={<div className="px-6 sm:px-8 lg:px-10 pt-6 pb-16 text-coffee-700">Loading marketplace...</div>}>
              <MarketplacePageContent />
            </Suspense>
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
          <div className="h-24 sm:h-32 bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center">
            <Sprout className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-50" />
          </div>
          <div className="p-3 sm:p-4 flex flex-col h-full">
            <h3 className="text-xs sm:text-sm font-semibold text-coffee-900 truncate">{listing.name || listing.category}</h3>
            <p className="text-xs text-coffee-600 mb-2 truncate">{listing.category}</p>
            <div className="space-y-1 mb-3 flex-grow">
              <div className="flex justify-between items-end">
                <span className="text-sm sm:text-lg font-bold text-primary-600">
                  {listing.price?.amount && formatCurrency(listing.price.amount)}
                </span>
                <span className="text-xs text-coffee-600">/{listing.price?.unit || 'unit'}</span>
              </div>
              {listing.stock?.quantity && (
                <div className="text-xs text-coffee-600">{listing.stock.quantity} {listing.stock.unit || 'units'}</div>
              )}
            </div>
            <button className="w-full py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium">
              View
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
          <div className="h-24 sm:h-32 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-50" />
          </div>
          <div className="p-3 sm:p-4 flex flex-col h-full">
            <h3 className="text-xs sm:text-sm font-semibold text-coffee-900 truncate">{listing.name}</h3>
            <p className="text-xs text-coffee-600 mb-2 truncate">{listing.category}</p>
            <div className="space-y-1 mb-3 flex-grow">
              <div className="flex justify-between items-end">
                <span className="text-sm sm:text-lg font-bold text-primary-600">
                  {listing.price && formatCurrency(listing.price)}
                </span>
              </div>
              {listing.weight && (
                <div className="text-xs text-coffee-600">{formatWeight(listing.weight)}</div>
              )}
            </div>
            <button className="w-full py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium">
              View
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Coffee lots
  return (
    <Link href={`/marketplace/coffee/${listing._id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-coffee-200 hover:border-primary-600 h-full flex flex-col cursor-pointer">
        <div className="relative h-24 sm:h-32 flex items-center justify-center overflow-hidden flex-shrink-0" 
          style={{
            backgroundColor: lot?.region === 'Mt. Elgon' ? '#4a7c59' : 
                            lot?.region === 'Fort Portal' ? '#9b7653' :
                            lot?.region === 'Rwenzori' ? '#7a5a3a' :
                            lot?.region === 'Kibale' ? '#6b8e23' :
                            '#a68968'
          }}>
          
          {hasGps && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm">
              <Award className="h-3 w-3" />
              <span className="hidden sm:inline">GPS Verified</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="text-xs sm:text-sm font-semibold text-coffee-900 flex-1 truncate">{lot?.variety || 'Coffee Lot'}</h3>
            {lot?.gradeScore && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded whitespace-nowrap">
                {computeGrade(lot.gradeScore)}
              </span>
            )}
          </div>

          <p className="text-xs text-coffee-600 mb-2 truncate">{farmer?.farmerName || 'Private Seller'}</p>

          <div className="space-y-1 mb-3 flex-grow">
            <div className="flex justify-between items-end">
              <span className="text-sm sm:text-lg font-bold text-primary-600">
                {lot?.pricePerKg && formatCurrency(lot.pricePerKg)}
              </span>
              <span className="text-xs text-coffee-600">/kg</span>
            </div>
            {lot?.availableQuantity && (
              <div className="text-xs text-coffee-600">{lot.availableQuantity}kg</div>
            )}
          </div>

          <button className="w-full py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

function ListingListItem({ listing, type, computeGrade }) {
  const lot = listing.lotId || listing;

  // Build the appropriate URL based on type
  let href = `/marketplace/${listing._id}`;
  if (type === 'coffee') {
    href = `/marketplace/coffee/${listing._id}`;
  } else if (type === 'agro') {
    href = `/marketplace/agro/${listing._id}`;
  } else if (type === 'products') {
    href = `/marketplace/products/${listing._id}`;
  }

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg border border-coffee-200 hover:border-primary-600 hover:shadow-md transition-all p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-200 to-amber-300 rounded-lg flex-shrink-0 flex items-center justify-center">
          {type === 'coffee' ? (
            <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-white opacity-40" />
          ) : type === 'agro' ? (
            <Sprout className="h-8 w-8 sm:h-10 sm:w-10 text-white opacity-40" />
          ) : (
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white opacity-40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-coffee-900 truncate">{lot?.variety || listing.name}</h3>
          <p className="text-xs sm:text-sm text-coffee-600 truncate">{listing.category || lot?.region}</p>
          
          {type === 'coffee' && (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-primary-600">
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
            <span className="text-sm sm:text-base font-bold text-primary-600 block mt-1.5">
              {listing.price && formatCurrency(listing.price)}
            </span>
          )}
        </div>

        <button className="px-4 sm:px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 h-fit">
          View
        </button>
      </div>
    </Link>
  );
}
