'use client';

import { useState } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

export default function DocumentUpload({ entityType, entityId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    documentType: 'national_id',
    documentNumber: '',
    issuedDate: '',
    expiryDate: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentTypes = [
    { value: 'national_id', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'land_title', label: 'Land Title' },
    { value: 'lease_agreement', label: 'Lease Agreement' },
    { value: 'tax_certificate', label: 'Tax Certificate' },
    { value: 'business_registration', label: 'Business Registration' },
    { value: 'organic_certificate', label: 'Organic Certificate' },
    { value: 'fairtrade_certificate', label: 'Fair Trade Certificate' },
    { value: 'rainforest_certificate', label: 'Rainforest Alliance Certificate' },
    { value: 'farm_photo', label: 'Farm Photo' },
    { value: 'other', label: 'Other' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and PDF files are allowed');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const uploadToCloudinary = async (file) => {
    // In production, you'd upload to Cloudinary or your preferred storage
    // For now, we'll simulate with a data URL (not recommended for production)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In production, replace this with actual Cloudinary upload
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileUrl = await uploadToCloudinary(selectedFile);

      // Create document record
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          fileName: selectedFile.name,
          fileUrl,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          issuedDate: formData.issuedDate || undefined,
          expiryDate: formData.expiryDate || undefined,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setSuccess('Document uploaded successfully! It will be reviewed by an admin.');
      setSelectedFile(null);
      setFormData({
        documentType: 'national_id',
        documentNumber: '',
        issuedDate: '',
        expiryDate: '',
        notes: '',
      });

      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

      if (onUploadComplete) {
        onUploadComplete(data.document);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-coffee-200 p-6">
      <h3 className="text-lg font-semibold text-coffee-900 mb-4">Upload Document</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Document Type *
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Document Number (optional)
          </label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., ID123456789"
          />
        </div>

        {/* Issued Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1">
              Issued Date (optional)
            </label>
            <input
              type="date"
              value={formData.issuedDate}
              onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
              className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Upload File * (JPG, PNG, PDF - Max 10MB)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-coffee-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
            <div className="space-y-1 text-center">
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-primary-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-coffee-900">{selectedFile.name}</p>
                    <p className="text-xs text-coffee-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-coffee-400" />
                  <div className="flex text-sm text-coffee-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-coffee-500">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any additional information..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Upload Document
            </>
          )}
        </button>
      </form>
    </div>
  );
}
