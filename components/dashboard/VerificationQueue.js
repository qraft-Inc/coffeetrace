'use client';

import { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, Download, Calendar, User, AlertCircle } from 'lucide-react';

export default function VerificationQueue() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents?verificationStatus=${filter}&limit=50`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId, status, reason = '') => {
    try {
      setProcessing(true);
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: status,
          rejectionReason: reason,
        }),
      });

      if (res.ok) {
        // Refresh the list
        fetchDocuments();
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Failed to update document:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-coffee-900">Document Verification Queue</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-800 font-semibold'
                : 'bg-white text-coffee-700 border border-coffee-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-green-100 text-green-800 font-semibold'
                : 'bg-white text-coffee-700 border border-coffee-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected'
                ? 'bg-red-100 text-red-800 font-semibold'
                : 'bg-white text-coffee-700 border border-coffee-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-coffee-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <FileText className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600">No {filter} documents found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-coffee-600" />
                    <h3 className="font-semibold text-coffee-900">
                      {getDocumentTypeLabel(doc.documentType)}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.verificationStatus)}`}>
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-coffee-600 mt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{doc.userId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span>{doc.entityType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                    {doc.documentNumber && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Doc #:</span>
                        <span>{doc.documentNumber}</span>
                      </div>
                    )}
                  </div>

                  {doc.rejectionReason && (
                    <div className="mt-3 flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                        <p className="text-sm text-red-700">{doc.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-5 w-5" />
                  </a>
                  <a
                    href={doc.fileUrl}
                    download
                    className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVerify(doc._id, 'approved')}
                        disabled={processing}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleVerify(doc._id, 'rejected', reason);
                        }}
                        disabled={processing}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
