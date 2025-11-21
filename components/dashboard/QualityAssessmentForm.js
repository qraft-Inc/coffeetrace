'use client';

import { useState, useEffect } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function QualityAssessmentForm({ lotId, lotNumber, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    assessmentType: 'cherry_picking',
    stage: 'harvest',
    moistureLevel: '',
    temperature: '',
    notes: '',
    defects: [],
    fermentation: null,
    drying: null,
    media: [],
  });

  const assessmentTypes = [
    { value: 'cherry_picking', label: 'Cherry Picking' },
    { value: 'fermentation', label: 'Fermentation' },
    { value: 'drying', label: 'Drying' },
    { value: 'milling', label: 'Milling' },
    { value: 'grading', label: 'Grading' },
    { value: 'cupping', label: 'Cupping' },
  ];

  const stages = [
    { value: 'pre_harvest', label: 'Pre-Harvest' },
    { value: 'harvest', label: 'Harvest' },
    { value: 'wet_processing', label: 'Wet Processing' },
    { value: 'drying', label: 'Drying' },
    { value: 'dry_milling', label: 'Dry Milling' },
    { value: 'final_grading', label: 'Final Grading' },
  ];

  const defectTypes = [
    { value: 'mould', label: 'Mould', severity: 'critical' },
    { value: 'insect_damage', label: 'Insect Damage', severity: 'high' },
    { value: 'unripe', label: 'Unripe Beans', severity: 'medium' },
    { value: 'overripe', label: 'Overripe Beans', severity: 'medium' },
    { value: 'fermented', label: 'Over-Fermented', severity: 'high' },
    { value: 'foreign_matter', label: 'Foreign Matter', severity: 'low' },
    { value: 'broken', label: 'Broken Beans', severity: 'low' },
    { value: 'black', label: 'Black Beans', severity: 'high' },
    { value: 'sour', label: 'Sour Beans', severity: 'high' },
  ];

  const addDefect = (defectType) => {
    const defect = defectTypes.find(d => d.value === defectType);
    if (!formData.defects.find(d => d.defectType === defectType)) {
      setFormData({
        ...formData,
        defects: [...formData.defects, {
          defectType: defect.value,
          count: 1,
          percentage: 0,
          severity: defect.severity,
        }],
      });
    }
  };

  const updateDefect = (index, field, value) => {
    const newDefects = [...formData.defects];
    newDefects[index][field] = value;
    setFormData({ ...formData, defects: newDefects });
  };

  const removeDefect = (index) => {
    setFormData({
      ...formData,
      defects: formData.defects.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, simulate upload
    const uploadedMedia = files.map(file => ({
      type: file.type.startsWith('image') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      caption: '',
      uploadedAt: new Date(),
    }));
    
    setFormData({
      ...formData,
      media: [...formData.media, ...uploadedMedia],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Get location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
          };
        } catch (err) {
          console.log('Geolocation not available');
        }
      }

      const res = await fetch('/api/quality-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId,
          ...formData,
          location,
          moistureLevel: formData.moistureLevel ? parseFloat(formData.moistureLevel) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create assessment');
      }

      setMessage({ type: 'success', text: 'Quality assessment created successfully!' });
      
      // Reset form
      setFormData({
        assessmentType: 'cherry_picking',
        stage: 'harvest',
        moistureLevel: '',
        temperature: '',
        notes: '',
        defects: [],
        fermentation: null,
        drying: null,
        media: [],
      });

      if (onSuccess) onSuccess(data.assessment);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">
        New Quality Assessment - Lot {lotNumber}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assessment Type & Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type
            </label>
            <select
              value={formData.assessmentType}
              onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {assessmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moisture Level (%) {formData.moistureLevel && (
                <span className={`ml-2 text-sm ${
                  formData.moistureLevel >= 11 && formData.moistureLevel <= 12
                    ? 'text-green-600'
                    : 'text-amber-600'
                }`}>
                  {formData.moistureLevel >= 11 && formData.moistureLevel <= 12
                    ? '✓ Optimal'
                    : '⚠ Outside optimal range (11-12%)'}
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.moistureLevel}
              onChange={(e) => setFormData({ ...formData, moistureLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 11.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 22.5"
            />
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos/Videos
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md cursor-pointer hover:bg-green-100 transition-colors">
              <Camera className="w-5 h-5 mr-2" />
              <span>Take Photo</span>
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
              <Upload className="w-5 h-5 mr-2" />
              <span>Upload Files</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {formData.media.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {formData.media.map((item, index) => (
                <div key={index} className="relative">
                  {item.type === 'image' ? (
                    <img src={item.url} alt="Upload" className="w-full h-24 object-cover rounded" />
                  ) : (
                    <video src={item.url} className="w-full h-24 object-cover rounded" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Defects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Defects Detected
          </label>
          <div className="mb-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDefect(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">+ Add Defect</option>
              {defectTypes.map(defect => (
                <option key={defect.value} value={defect.value}>
                  {defect.label} ({defect.severity})
                </option>
              ))}
            </select>
          </div>

          {formData.defects.length > 0 && (
            <div className="space-y-2">
              {formData.defects.map((defect, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm font-medium">
                    {defectTypes.find(d => d.value === defect.defectType)?.label}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={defect.percentage}
                    onChange={(e) => updateDefect(index, 'percentage', parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="%"
                  />
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      defect.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : defect.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : defect.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {defect.severity}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDefect(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Additional observations..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Creating Assessment...' : 'Create Quality Assessment'}
        </button>
      </form>
    </div>
  );
}
