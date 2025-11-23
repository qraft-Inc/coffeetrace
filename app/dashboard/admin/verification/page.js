'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { CheckCircle, XCircle, Clock, FileText, Download, Eye } from 'lucide-react';

export default function AdminVerificationPage() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/farmers?verificationStatus=pending');
      if (response.ok) {
        const data = await response.json();
        setPendingVerifications(Array.isArray(data) ? data : data.farmers || []);
      } else {
        setPendingVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setPendingVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (farmerId, status, notes) => {
    try {
      const response = await fetch(`/api/farmers/${farmerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: status,
          verificationNotes: notes,
          verifiedAt: new Date()
        })
      });

      if (response.ok) {
        fetchPendingVerifications();
        setSelectedFarmer(null);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  return (
    <RequireAuth allowedRoles={['admin']}>
      <DashboardLayout title="Farmer Verification">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingVerifications.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified Today</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Verification Queue */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Loading verifications...
                </div>
              ) : !Array.isArray(pendingVerifications) || pendingVerifications.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No pending verifications
                </div>
              ) : (
                pendingVerifications.map((farmer) => (
                  <div key={farmer._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{farmer.name}</h3>
                        <p className="text-sm text-gray-500">{farmer.email}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📍 {farmer.location?.district || farmer.location?.region || 'Location not provided'}</span>
                          <span>🌾 {farmer.farmSize || 'N/A'} hectares</span>
                          <span>📅 Applied: {new Date(farmer.createdAt).toLocaleDateString()}</span>
                        </div>
                        {farmer.documents && farmer.documents.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {farmer.documents.map((doc, index) => (
                              <button
                                key={index}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                              >
                                <FileText className="h-4 w-4" />
                                {doc.type}
                                <Download className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => setSelectedFarmer(farmer)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </button>
                        <button
                          onClick={() => handleVerification(farmer._id, 'verified', 'Approved by admin')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerification(farmer._id, 'rejected', 'Additional documentation required')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Modal */}
          {selectedFarmer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Review Farmer Application</h2>
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedFarmer.name}</h3>
                    <p className="text-gray-600">{selectedFarmer.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{selectedFarmer.location?.district || selectedFarmer.location?.region || selectedFarmer.location?.country || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farm Size</p>
                      <p className="text-gray-900">{selectedFarmer.farmSize || 'N/A'} hectares</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedFarmer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied</p>
                      <p className="text-gray-900">{new Date(selectedFarmer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerification(selectedFarmer._id, 'verified', 'Approved by admin')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(selectedFarmer._id, 'rejected', 'Additional documentation required')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
