'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { Search, Filter, Star, MessageSquare, Clock, BookOpen, MapPin } from 'lucide-react';

const SERVICE_TYPES = {
  consultation: { label: '1-on-1 Consultation', icon: '💬' },
  farm_visit: { label: 'Farm Visit', icon: '🚜' },
  training: { label: 'Individual Training', icon: '📚' },
  monitoring: { label: 'Crop Monitoring', icon: '👁️' },
  group_training: { label: 'Group Training', icon: '👥' },
};

export default function FarmerAgronomistPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [session?.user?.id, filterType]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) {
        params.set('serviceType', filterType);
      }
      const res = await fetch(`/api/agronomist-services?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load services');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.services || [];
      setServices(list);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const nameMatch = `${service.firstName} ${service.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const specialMatch = service.specializations?.some(s =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    ) || false;
    return nameMatch || specialMatch;
  });

  return (
    <RequireAuth allowedRoles={['farmer']}>
      <DashboardLayout title="Agronomist Services">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Expert Agronomist Services</h1>
            <p className="text-green-100">
              Connect with qualified agronomists from your cooperative for expert guidance on crop management, 
              pest control, soil health, and sustainable farming practices.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Services</option>
                <option value="consultation">1-on-1 Consultation</option>
                <option value="farm_visit">Farm Visit</option>
                <option value="training">Individual Training</option>
                <option value="monitoring">Crop Monitoring</option>
                <option value="group_training">Group Training</option>
              </select>
            </div>
          </div>

          {/* Services Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading agronomists...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No agronomists found</p>
                <p className="text-sm">Your cooperative may not have registered agronomists yet. Contact your cooperative admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredServices.map((agronomist) => (
                  <div
                    key={agronomist._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
                  >
                    {/* Header with image placeholder */}
                    <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      {agronomist.profileImage ? (
                        <img
                          src={agronomist.profileImage}
                          alt={`${agronomist.firstName} ${agronomist.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">👨‍🌾</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* Name and Service Type */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {agronomist.firstName} {agronomist.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl">{SERVICE_TYPES[agronomist.serviceType]?.icon}</span>
                          <span className="text-sm font-medium text-green-600">
                            {SERVICE_TYPES[agronomist.serviceType]?.label}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      {agronomist.stats?.averageRating > 0 && (
                        <div className="flex items-center gap-2 py-2 border-y border-gray-200">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < Math.round(agronomist.stats.averageRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {agronomist.stats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-600">
                            ({agronomist.stats.reviewCount} reviews)
                          </span>
                        </div>
                      )}

                      {/* Specializations */}
                      {agronomist.specializations && agronomist.specializations.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-1">
                            {agronomist.specializations.slice(0, 3).map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            ))}
                            {agronomist.specializations.length > 3 && (
                              <span className="px-2 py-1 text-gray-600 text-xs">
                                +{agronomist.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 py-2">
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} className="text-green-600" />
                          <span>{agronomist.stats?.completedSessions || 0} sessions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-blue-600" />
                          <span>Response: {agronomist.stats?.responseTimeHours || 24}h</span>
                        </div>
                      </div>

                      {/* Description */}
                      {agronomist.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{agronomist.description}</p>
                      )}

                      {/* Pricing */}
                      {agronomist.pricePerSession > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              {agronomist.pricePerSession.toLocaleString()} {agronomist.currency}
                            </span>
                            <span className="text-xs text-gray-600">per {agronomist.priceModel}</span>
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      <div className="pt-3 space-y-2">
                        {agronomist.phone && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Phone:</span> {agronomist.phone}
                          </div>
                        )}
                        {agronomist.email && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Email:</span> {agronomist.email}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                          <MessageSquare size={16} />
                          Contact
                        </button>
                        <button className="flex-1 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium text-sm transition-colors">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
