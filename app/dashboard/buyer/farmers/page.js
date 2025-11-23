'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Search, MapPin, Leaf, Award, Filter } from 'lucide-react';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';

export default function FarmersListPage() {
  const { data: session } = useSession();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFarmers();
  }, [page]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/farmers?${params}`);
      const data = await response.json();
      
      setFarmers(data.farmers || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFarmers();
  };

  return (
    <DashboardLayout title="Meet Our Farmers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">Meet Our Farmers</h1>
          <p className="text-coffee-600">
            Discover the stories behind your coffee and support farmers directly
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farmers by name, location, or variety..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Coffee className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
            <p className="text-coffee-600 text-lg">No farmers found.</p>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                  fetchFarmers();
                }}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {farmers.map((farmer) => (
                <Link
                  key={farmer._id}
                  href={`/dashboard/buyer/farmers/${farmer._id}`}
                  className="group bg-white border border-coffee-200 rounded-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="relative h-56 bg-gradient-to-br from-green-100 to-green-200">
                    {farmer.profilePhotoUrl ? (
                      <img
                        src={farmer.profilePhotoUrl}
                        alt={farmer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : farmer.photos && farmer.photos[0]?.url ? (
                      <img
                        src={farmer.photos[0].url}
                        alt={farmer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee className="h-20 w-20 text-green-600 opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{farmer.name}</h3>
                      {farmer.location?.district && (
                        <p className="text-white/90 text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farmer.location.district}, {farmer.location.country || 'Rwanda'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      {farmer.farmSize && (
                        <div className="flex items-center gap-2 text-sm text-coffee-600">
                          <Leaf className="h-4 w-4 text-green-600" />
                          <span>{farmer.farmSize} {farmer.farmSizeUnit || 'hectares'}</span>
                        </div>
                      )}
                      {farmer.primaryVariety && (
                        <div className="flex items-center gap-2 text-sm text-coffee-600">
                          <Coffee className="h-4 w-4 text-coffee-600" />
                          <span>{farmer.primaryVariety}</span>
                        </div>
                      )}
                      {farmer.altitude && (
                        <div className="flex items-center gap-2 text-sm text-coffee-600">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>{farmer.altitude}m altitude</span>
                        </div>
                      )}
                    </div>

                    {farmer.certifications && farmer.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {farmer.certifications.slice(0, 2).map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1"
                          >
                            <Award className="h-3 w-3" />
                            {typeof cert === 'string' ? cert : cert.name || 'Certified'}
                          </span>
                        ))}
                        {farmer.certifications.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{farmer.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-primary-600 group-hover:text-primary-700 text-sm font-semibold flex items-center gap-1">
                      Read Their Story
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-coffee-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
