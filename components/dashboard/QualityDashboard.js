'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Camera, FileText } from 'lucide-react';

export default function QualityDashboard({ farmerId, lotId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, [farmerId, lotId, filter]);

  const fetchAssessments = async () => {
    try {
      const params = new URLSearchParams();
      if (farmerId) params.append('farmerId', farmerId);
      if (lotId) params.append('lotId', lotId);
      if (filter !== 'all') params.append('type', filter);

      const res = await fetch(`/api/quality-assessments?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessmentTypes = [
    { value: 'all', label: 'All Assessments' },
    { value: 'cherry_picking', label: 'Cherry Picking' },
    { value: 'fermentation', label: 'Fermentation' },
    { value: 'drying', label: 'Drying' },
    { value: 'grading', label: 'Grading' },
    { value: 'cupping', label: 'Cupping' },
  ];

  const getGradeColor = (grade) => {
    const colors = {
      'AA': 'bg-purple-100 text-purple-800',
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'PB': 'bg-orange-100 text-orange-800',
      'reject': 'bg-red-100 text-red-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averageScore = assessments.length > 0
    ? (assessments.reduce((sum, a) => sum + a.qualityScore, 0) / assessments.length).toFixed(1)
    : 0;

  const recentAlerts = assessments
    .filter(a => a.alerts && a.alerts.length > 0)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{recentAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Grade</p>
              <p className="text-2xl font-bold text-purple-600">
                {assessments[0]?.grade || 'N/A'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Active Quality Alerts
          </h3>
          <div className="space-y-2">
            {recentAlerts.map((assessment) =>
              assessment.alerts.map((alert, idx) => (
                <div
                  key={`${assessment._id}-${idx}`}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        Lot {assessment.lotId?.lotNumber} - {alert.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {assessmentTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === type.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No assessments found</p>
          ) : (
            assessments.map((assessment) => (
              <div
                key={assessment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">
                        Lot {assessment.lotId?.lotNumber}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getGradeColor(assessment.grade)}`}>
                        Grade {assessment.grade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {assessment.assessmentType.replace(/_/g, ' ')} · {assessment.stage.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(assessment.qualityScore)}`}>
                      {assessment.qualityScore}
                    </p>
                    <p className="text-xs text-gray-500">Quality Score</p>
                  </div>
                </div>

                {assessment.moistureLevel && (
                  <div className="flex items-center space-x-4 text-sm mb-2">
                    <span className="text-gray-600">
                      💧 Moisture: <strong>{assessment.moistureLevel}%</strong>
                    </span>
                    {assessment.temperature && (
                      <span className="text-gray-600">
                        🌡️ Temp: <strong>{assessment.temperature}°C</strong>
                      </span>
                    )}
                  </div>
                )}

                {assessment.defects && assessment.defects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {assessment.defects.map((defect, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {defect.defectType.replace(/_/g, ' ')}: {defect.percentage}%
                      </span>
                    ))}
                  </div>
                )}

                {assessment.media && assessment.media.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Camera className="w-4 h-4 mr-1" />
                    {assessment.media.length} photo{assessment.media.length > 1 ? 's' : ''}
                  </div>
                )}

                {assessment.recommendations && assessment.recommendations.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-800 mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
