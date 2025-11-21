'use client';

import { useState } from 'react';
import { Truck, MapPin, Calendar, Package } from 'lucide-react';

export default function PickupRequestForm({ farmerId, lots, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    lotId: '',
    requestType: 'collection',
    estimatedWeight: '',
    coffeeType: 'arabica',
    packagingType: 'bags',
    numberOfPackages: '',
    requestedDate: '',
    preferredTimeSlot: 'flexible',
    urgency: 'medium',
    pickupLocation: {
      district: '',
      sector: '',
      cell: '',
      village: '',
      description: '',
    },
    specialInstructions: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Get geolocation if available
      let coordinates = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          coordinates = [position.coords.longitude, position.coords.latitude];
        } catch (err) {
          console.log('Geolocation not available');
        }
      }

      const payload = {
        ...formData,
        estimatedWeight: parseFloat(formData.estimatedWeight),
        numberOfPackages: parseInt(formData.numberOfPackages) || undefined,
        pickupLocation: {
          type: 'Point',
          coordinates: coordinates || [30.0619, -1.9403], // Default to Kigali
          address: formData.pickupLocation,
        },
      };

      const res = await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create pickup request');
      }

      setMessage({ type: 'success', text: 'Pickup request created successfully!' });
      
      // Reset form
      setFormData({
        lotId: '',
        requestType: 'collection',
        estimatedWeight: '',
        coffeeType: 'arabica',
        packagingType: 'bags',
        numberOfPackages: '',
        requestedDate: '',
        preferredTimeSlot: 'flexible',
        urgency: 'medium',
        pickupLocation: {
          district: '',
          sector: '',
          cell: '',
          village: '',
          description: '',
        },
        specialInstructions: '',
      });

      if (onSuccess) onSuccess(data.pickupRequest);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Truck className="w-6 h-6 mr-2 text-green-600" />
        Request Coffee Pickup
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
        {/* Lot Selection */}
        {lots && lots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lot (Optional)
            </label>
            <select
              value={formData.lotId}
              onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">New/Unregistered Lot</option>
              {lots.map(lot => (
                <option key={lot._id} value={lot._id}>
                  {lot.lotNumber} - {lot.weight} kg ({lot.coffeeType})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Coffee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.estimatedWeight}
              onChange={(e) => setFormData({ ...formData, estimatedWeight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coffee Type
            </label>
            <select
              value={formData.coffeeType}
              onChange={(e) => setFormData({ ...formData, coffeeType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="arabica">Arabica</option>
              <option value="robusta">Robusta</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Packaging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Packaging Type
            </label>
            <select
              value={formData.packagingType}
              onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="bags">Bags</option>
              <option value="bulk">Bulk</option>
              <option value="containers">Containers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Packages
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfPackages}
              onChange={(e) => setFormData({ ...formData, numberOfPackages: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 10"
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pickup Location
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.pickupLocation.district}
              onChange={(e) => setFormData({
                ...formData,
                pickupLocation: { ...formData.pickupLocation, district: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="District *"
              required
            />
            <input
              type="text"
              value={formData.pickupLocation.sector}
              onChange={(e) => setFormData({
                ...formData,
                pickupLocation: { ...formData.pickupLocation, sector: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Sector"
            />
            <input
              type="text"
              value={formData.pickupLocation.cell}
              onChange={(e) => setFormData({
                ...formData,
                pickupLocation: { ...formData.pickupLocation, cell: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Cell"
            />
            <input
              type="text"
              value={formData.pickupLocation.village}
              onChange={(e) => setFormData({
                ...formData,
                pickupLocation: { ...formData.pickupLocation, village: e.target.value }
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Village"
            />
          </div>
          <textarea
            value={formData.pickupLocation.description}
            onChange={(e) => setFormData({
              ...formData,
              pickupLocation: { ...formData.pickupLocation, description: e.target.value }
            })}
            rows={2}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Additional location details (landmarks, directions)"
          />
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Date *
            </label>
            <input
              type="date"
              value={formData.requestedDate}
              onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Preference
            </label>
            <select
              value={formData.preferredTimeSlot}
              onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="morning">Morning (6-12)</option>
              <option value="afternoon">Afternoon (12-17)</option>
              <option value="evening">Evening (17-20)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Any special handling requirements or notes..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Creating Request...' : 'Request Pickup'}
        </button>
      </form>
    </div>
  );
}
