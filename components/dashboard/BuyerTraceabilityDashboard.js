'use client';

import { useState, useEffect } from 'react';
import { MapPin, Award, Leaf, TrendingUp, FileText, Package, ShieldCheck } from 'lucide-react';

export default function BuyerTraceabilityDashboard({ lotId, traceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTraceability();
  }, [lotId, traceId]);

  const fetchTraceability = async () => {
    try {
      const params = new URLSearchParams();
      if (lotId) params.append('lotId', lotId);
      if (traceId) params.append('traceId', traceId);

      const response = await fetch(`/api/buyer/traceability?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.traceability);
      }
    } catch (error) {
      console.error('Error fetching traceability:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No traceability data available</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'farm', label: 'Farm Origin', icon: MapPin },
    { id: 'quality', label: 'Quality', icon: Award },
    { id: 'processing', label: 'Processing', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'story', label: 'Story', icon: FileText },
  ];

  const getRiskColor = (risk) => {
    const colors = {
      negligible: 'text-green-600 bg-green-50',
      low: 'text-blue-600 bg-blue-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50',
    };
    return colors[risk] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-2">Coffee Traceability</h1>
        <p className="text-green-100">Lot: {data.lot.traceId}</p>
        <div className="flex items-center space-x-6 mt-4">
          <div>
            <p className="text-sm text-green-200">Variety</p>
            <p className="font-semibold">{data.lot.variety}</p>
          </div>
          <div>
            <p className="text-sm text-green-200">Quantity</p>
            <p className="font-semibold">{data.lot.quantityKg} kg</p>
          </div>
          <div>
            <p className="text-sm text-green-200">Quality Score</p>
            <p className="font-semibold">{data.quality.latestScore?.toFixed(1) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-green-200">Grade</p>
            <p className="font-semibold">{data.quality.latestGrade || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Origin</h3>
                </div>
                <p className="text-gray-700">{data.farmer.name}</p>
                <p className="text-sm text-gray-600">
                  {data.farm.location?.district}, {data.farm.location?.region}
                </p>
                <p className="text-sm text-gray-600">{data.farm.altitude}m altitude</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Quality</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">{data.quality.avgScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Quality Score</p>
                <p className="text-sm text-gray-600">{data.quality.assessments.length} assessments</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Compliance</h3>
                </div>
                {data.compliance.eudr ? (
                  <>
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {data.compliance.eudr.status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Score: {data.compliance.eudr.complianceScore}/100
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Pending verification</p>
                )}
              </div>
            </div>
          )}

          {/* Farm Origin Tab */}
          {activeTab === 'farm' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Farm Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Farm Size</p>
                    <p className="font-semibold">{(data.farm.size * 2.47105).toFixed(1)} acres</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Altitude</p>
                    <p className="font-semibold">{data.farm.altitude}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Soil Type</p>
                    <p className="font-semibold capitalize">{data.farm.soilType?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Climate Zone</p>
                    <p className="font-semibold capitalize">{data.farm.climateZone}</p>
                  </div>
                </div>
              </div>

              {data.farm.varieties && data.farm.varieties.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Coffee Varieties</h4>
                  <div className="space-y-2">
                    {data.farm.varieties.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="font-medium">{v.name}</span>
                        <span className="text-sm text-gray-600">{v.percentage}% of farm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.farm.photos && data.farm.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Farm Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.farm.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Farm photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quality Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-green-700">{data.quality.avgScore.toFixed(1)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Latest Grade</p>
                  <p className="text-3xl font-bold text-blue-700">{data.quality.latestGrade}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Assessments</p>
                  <p className="text-3xl font-bold text-purple-700">{data.quality.assessments.length}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quality History</h4>
                <div className="space-y-3">
                  {data.quality.assessments.map((assessment, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Grade: {assessment.grade}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Score</p>
                          <p className="font-semibold">{assessment.overallScore}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Moisture</p>
                          <p className="font-semibold">{assessment.moistureContent}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Defects</p>
                          <p className="font-semibold">{assessment.defects?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Processing Tab */}
          {activeTab === 'processing' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Processing Method</h4>
                <p className="text-lg capitalize">{data.processing.method?.replace('_', ' ') || 'Not specified'}</p>
              </div>

              {data.processing.wetMill && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Wet Mill Processing</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Fermentation Method</p>
                      <p className="font-medium capitalize">
                        {data.processing.wetMill.fermentation?.method?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">{data.processing.wetMill.fermentation?.duration}h</p>
                    </div>
                  </div>
                </div>
              )}

              {data.processing.drying && (
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Drying Process</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Method</p>
                      <p className="font-medium capitalize">
                        {data.processing.drying.method?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Final Moisture</p>
                      <p className="font-medium">{data.processing.drying.finalQuality?.moistureContent}%</p>
                    </div>
                  </div>
                </div>
              )}

              {data.processing.dryMill && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-900 mb-2">Dry Mill Processing</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Input Weight</p>
                      <p className="font-medium">{data.processing.dryMill.inputWeightKg} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Yield</p>
                      <p className="font-medium">{data.processing.dryMill.outputSummary?.yieldPercentage}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {data.compliance.eudr ? (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">EUDR Compliance</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        data.compliance.eudr.status === 'compliant'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {data.compliance.eudr.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Compliance Score</p>
                      <p className="text-2xl font-bold text-gray-900">{data.compliance.eudr.complianceScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deforestation Risk</p>
                      <p
                        className={`text-lg font-semibold capitalize ${
                          getRiskColor(data.compliance.eudr.deforestationRisk)
                        }`}
                      >
                        {data.compliance.eudr.deforestationRisk}
                      </p>
                    </div>
                  </div>

                  {data.compliance.eudr.sustainability && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-semibold mb-2">Sustainability Data</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {data.compliance.eudr.sustainability.organicCertified && (
                          <div className="flex items-center text-green-600">
                            <Leaf className="w-4 h-4 mr-1" />
                            Organic Certified
                          </div>
                        )}
                        {data.compliance.eudr.sustainability.fairTradeCertified && (
                          <div className="flex items-center text-blue-600">
                            <Award className="w-4 h-4 mr-1" />
                            Fair Trade Certified
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">EUDR compliance data not available</p>
              )}

              {data.compliance.certifications && data.compliance.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.compliance.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {data.compliance.kycVerified ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">KYC Verified</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">KYC Pending</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="prose max-w-none">
              <h3>The Story of {data.farmer.name}'s Coffee</h3>
              <p>
                This exceptional coffee comes from {data.farmer.name}'s farm in{' '}
                {data.farm.location?.district}, {data.farm.location?.region}, situated at{' '}
                {data.farm.altitude} meters above sea level.
              </p>
              <p>
                The farm spans {(data.farm.size * 2.47105).toFixed(1)} acres of {data.farm.soilType} soil in a{' '}
                {data.farm.climateZone} climate zone, providing ideal conditions for growing{' '}
                {data.lot.variety} coffee.
              </p>
              <p>
                This lot was carefully processed using the {data.processing.method?.replace('_', ' ')}{' '}
                method and achieved an impressive quality score of {data.quality.latestScore?.toFixed(1)}{' '}
                with a grade of {data.quality.latestGrade}.
              </p>
              {data.compliance.eudr && (
                <p>
                  The coffee meets stringent EUDR compliance standards with a {data.compliance.eudr.deforestationRisk}{' '}
                  deforestation risk and an overall compliance score of {data.compliance.eudr.complianceScore}/100.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
