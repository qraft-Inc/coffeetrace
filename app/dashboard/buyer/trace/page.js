'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { QrCode, Search, MapPin, Calendar, User, Package, Award, CheckCircle } from 'lucide-react';

export default function BuyerTraceabilityPage() {
  const [traceId, setTraceId] = useState('');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrace = async () => {
    if (!traceId.trim()) return;
    
    setLoading(true);
    try {
      // Mock trace data
      setTimeout(() => {
        setTraceData({
          lotId: traceId,
          coffeeType: 'Arabica Bourbon',
          farmer: {
            name: 'John Mukasa',
            location: 'Kigali, Rwanda',
            farmSize: '5 hectares',
            certified: true
          },
          harvest: {
            date: '2024-01-15',
            altitude: '1800m',
            processing: 'Washed',
            dryingMethod: 'Sun-dried'
          },
          quality: {
            score: 88,
            cupping: 'Floral notes with honey sweetness',
            moisture: '11.5%',
            gradeDate: '2024-01-20'
          },
          journey: [
            { date: '2024-01-15', event: 'Coffee harvested', location: 'Farm, Kigali' },
            { date: '2024-01-16', event: 'Processing completed', location: 'Processing Station' },
            { date: '2024-01-20', event: 'Quality inspection passed', location: 'Quality Lab' },
            { date: '2024-01-22', event: 'Listed on marketplace', location: 'Platform' },
            { date: '2024-01-25', event: 'Purchased', location: 'Platform' }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error tracing lot:', error);
      setLoading(false);
    }
  };

  return (
    <RequireAuth allowedRoles={['buyer']}>
      <DashboardLayout title="Coffee Traceability">
        <div className="space-y-6">
          {/* Search Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trace Your Coffee</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Lot Trace ID or scan QR code..."
                  value={traceId}
                  onChange={(e) => setTraceId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrace()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleTrace}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                {loading ? 'Tracing...' : 'Trace'}
              </button>
            </div>
          </div>

          {/* Trace Results */}
          {traceData && (
            <div className="space-y-6">
              {/* Farmer Information */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Farmer Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Farmer Name</p>
                      <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        {traceData.farmer.name}
                        {traceData.farmer.certified && (
                          <CheckCircle className="h-5 w-5 text-green-600" title="Verified Farmer" />
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {traceData.farmer.location?.district || traceData.farmer.location?.region || traceData.farmer.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Farm Size</p>
                      <p className="text-base font-medium text-gray-900">{traceData.farmer.farmSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coffee Type</p>
                      <p className="text-base font-medium text-gray-900">{traceData.coffeeType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Harvest Details */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Harvest Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Harvest Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(traceData.harvest.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Altitude</p>
                      <p className="text-base font-medium text-gray-900">{traceData.harvest.altitude}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Processing Method</p>
                      <p className="text-base font-medium text-gray-900">{traceData.harvest.processing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Drying Method</p>
                      <p className="text-base font-medium text-gray-900">{traceData.harvest.dryingMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Information */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Quality Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Quality Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${traceData.quality.score}%` }}
                          ></div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{traceData.quality.score}/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Moisture Content</p>
                      <p className="text-base font-medium text-gray-900">{traceData.quality.moisture}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600">Cupping Notes</p>
                      <p className="text-base font-medium text-gray-900">{traceData.quality.cupping}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(traceData.quality.gradeDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Journey Timeline
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {traceData.journey.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === traceData.journey.length - 1 ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          {index !== traceData.journey.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-medium text-gray-900">{step.event}</p>
                          <p className="text-sm text-gray-500">{step.location}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(step.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!traceData && !loading && (
            <div className="bg-white rounded-lg p-12 text-center">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Enter a Trace ID above to view coffee journey details</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
