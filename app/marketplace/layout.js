'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Coffee, Sprout, Package, Filter, X } from 'lucide-react';

export default function MarketplaceLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'coffee';
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    variety: searchParams.get('variety') || '',
    minQuality: searchParams.get('minQuality') ? parseFloat(searchParams.get('minQuality')) : 0,
    maxPrice: searchParams.get('maxPrice') || '',
    certification: searchParams.get('certification') || '',
  });

  const updateTab = (tab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`/marketplace?${params.toString()}`);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    if (newFilters.variety) params.set('variety', newFilters.variety);
    if (newFilters.minQuality > 0) params.set('minQuality', newFilters.minQuality);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.certification) params.set('certification', newFilters.certification);

    router.push(`/marketplace?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ variety: '', minQuality: 0, maxPrice: '', certification: '' });
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm border-b border-coffee-200">
        <div className="w-full">
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
        <div className="flex gap-0 min-h-screen">
          {/* SIDEBAR - Desktop only */}
          <aside className="hidden lg:w-80 lg:flex flex-col flex-shrink-0 bg-white border-r border-coffee-200">
            <div className="p-8 overflow-y-auto flex-1">
              {/* Marketplace Label */}
              <h1 className="text-xs font-bold uppercase tracking-widest text-coffee-600 mb-8">Marketplace</h1>

              {/* Category Menu */}
              <div className="mb-10">
                <div className="space-y-2">
                  <button
                    onClick={() => updateTab('coffee')}
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
                      0
                    </span>
                  </button>
                  <button
                    onClick={() => updateTab('agro')}
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
                    onClick={() => updateTab('products')}
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
                      onChange={(e) => updateFilter('variety', e.target.value)}
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
                      onChange={(e) => updateFilter('minQuality', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 placeholder-coffee-500 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                      placeholder="Minimum: 0-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Max Price / kg</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-coffee-50 border border-coffee-200 rounded-lg text-sm text-coffee-900 placeholder-coffee-500 hover:border-coffee-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-coffee-900 mb-3">Certification</label>
                    <select
                      value={filters.certification}
                      onChange={(e) => updateFilter('certification', e.target.value)}
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
                    onClick={clearFilters}
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

          {/* MAIN CONTENT SLOT */}
          <main className="flex-1 w-full overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
