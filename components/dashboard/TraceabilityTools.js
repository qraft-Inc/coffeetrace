'use client';

import { useState } from 'react';
import { QrCode, Download, Share2 } from 'lucide-react';

export default function TraceabilityTools({ lotId, lotNumber }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const generateQRCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/lots/${lotId}/qr-code`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setQrCode(data);
      setMessage({ type: 'success', text: 'QR code generated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/lots/${lotId}/traceability-report`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traceability-${lotNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'PDF report downloaded!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const a = document.createElement('a');
    a.href = qrCode.qrCode;
    a.download = `qr-code-${lotNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyTraceabilityLink = () => {
    if (!qrCode) return;

    navigator.clipboard.writeText(qrCode.traceabilityUrl);
    setMessage({ type: 'success', text: 'Link copied to clipboard!' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <QrCode className="w-6 h-6 mr-2 text-green-600" />
        Traceability Tools - Lot {lotNumber}
      </h3>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Generate QR Code */}
        <div>
          <button
            onClick={generateQRCode}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
          >
            <QrCode className="w-5 h-5 mr-2" />
            {qrCode ? 'Regenerate QR Code' : 'Generate QR Code'}
          </button>
        </div>

        {/* QR Code Display */}
        {qrCode && (
          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <div className="flex flex-col items-center">
              <img
                src={qrCode.qrCode}
                alt="QR Code"
                className="w-64 h-64 mb-4"
              />
              <p className="text-sm text-gray-600 mb-4 text-center">
                Scan to view traceability information
              </p>

              <div className="flex space-x-2 w-full">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </button>
                <button
                  onClick={copyTraceabilityLink}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>

              <div className="mt-4 w-full bg-white rounded p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Traceability URL:</p>
                <p className="text-sm text-gray-900 break-all font-mono">
                  {qrCode.traceabilityUrl}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Download PDF Report */}
        <div>
          <button
            onClick={downloadPDF}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF Report
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">About Traceability</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• QR codes provide instant access to lot information</li>
            <li>• PDF reports can be shared with buyers and certifiers</li>
            <li>• All data is publicly verifiable and transparent</li>
            <li>• Quality assessments are included in the report</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
