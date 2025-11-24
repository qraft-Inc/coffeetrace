'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, MapPin, Leaf, Award, User, Phone, Mail, Mountain, Droplet, Sun, Trees } from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

export default function FarmerProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmerId, setFarmerId] = useState(null);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    phone: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    profilePhotoUrl: '',
    
    // Farm Location
    location: {
      country: '',
      region: '',
      district: '',
      coordinates: [],
    },
    
    // Farm Details
    farmSize: '',
    farmSizeUnit: 'acres',
    altitude: '',
    soilType: '',
    climateZone: '',
    shade: '',
    
    // Coffee Details
    primaryVariety: '',
    varieties: [],
    numberOfTrees: '',
    plantingDensity: '',
    
    // Rainfall
    rainfall: {
      annual: '',
      pattern: '',
    },
    
    // Certifications
    certifications: [],
    
    // Photos & Story
    photos: [],
  });

  useEffect(() => {
    if (session?.user?.farmerProfile) {
      setFarmerId(session.user.farmerProfile);
      fetchFarmerProfile(session.user.farmerProfile);
    }
  }, [session]);

  const fetchFarmerProfile = async (id) => {
    try {
      const response = await fetch(`/api/farmers/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Populate form with existing data
        setFormData(prev => ({
          ...prev,
          ...data.farmer,
          location: data.farmer.location || prev.location,
          rainfall: data.farmer.rainfall || prev.rainfall,
          varieties: data.farmer.varieties || [],
          certifications: data.farmer.certifications || [],
          photos: data.farmer.photos || [],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch farmer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCertificationChange = (index, value) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications,
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ''],
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmerId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/farmers/${farmerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        router.push('/dashboard/farmer');
      } else {
        const data = await response.json();
        alert(`Failed to update profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Update Farm Profile">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-coffee-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Update Farm Profile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">Tell Your Farm's Story</h1>
          <p className="text-coffee-600">
            Share your journey, farming practices, and what makes your coffee special
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-900">Personal Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Farm Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-900">Farm Location</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Rwanda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Region/Province
                </label>
                <input
                  type="text"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Southern Province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Huye"
                />
              </div>
            </div>
          </div>

          {/* Farm Characteristics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Mountain className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-900">Farm Characteristics</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Farm Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2.5"
                  />
                  <select
                    name="farmSizeUnit"
                    value={formData.farmSizeUnit}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="acres">Acres</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Mountain className="inline h-4 w-4 mr-1" />
                  Altitude (meters above sea level)
                </label>
                <input
                  type="number"
                  name="altitude"
                  value={formData.altitude}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 1800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Soil Type
                </label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select soil type</option>
                  <option value="volcanic">Volcanic</option>
                  <option value="clay">Clay</option>
                  <option value="loam">Loam</option>
                  <option value="sandy">Sandy</option>
                  <option value="laterite">Laterite</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Climate Zone
                </label>
                <select
                  name="climateZone"
                  value={formData.climateZone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select climate zone</option>
                  <option value="tropical">Tropical</option>
                  <option value="subtropical">Subtropical</option>
                  <option value="temperate">Temperate</option>
                  <option value="highland">Highland</option>
                  <option value="lowland">Lowland</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Droplet className="inline h-4 w-4 mr-1" />
                  Annual Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="rainfall.annual"
                  value={formData.rainfall.annual}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Rainfall Pattern
                </label>
                <select
                  name="rainfall.pattern"
                  value={formData.rainfall.pattern}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select pattern</option>
                  <option value="bimodal">Bimodal (2 rainy seasons)</option>
                  <option value="unimodal">Unimodal (1 rainy season)</option>
                  <option value="year-round">Year-round</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Sun className="inline h-4 w-4 mr-1" />
                  Shade Management
                </label>
                <select
                  name="shade"
                  value={formData.shade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select shade level</option>
                  <option value="full_sun">Full Sun</option>
                  <option value="partial_shade">Partial Shade</option>
                  <option value="full_shade">Full Shade</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coffee Cultivation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Leaf className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-900">Coffee Cultivation</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Primary Coffee Variety
                </label>
                <input
                  type="text"
                  name="primaryVariety"
                  value={formData.primaryVariety}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Bourbon, Catuai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  <Trees className="inline h-4 w-4 mr-1" />
                  Number of Coffee Trees
                </label>
                <input
                  type="number"
                  name="numberOfTrees"
                  value={formData.numberOfTrees}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Planting Density (trees/acre)
                </label>
                <input
                  type="number"
                  name="plantingDensity"
                  value={formData.plantingDensity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2000"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-coffee-900">Certifications</h2>
            </div>

            <div className="space-y-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCertification}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Certification
              </button>
            </div>

            <p className="mt-4 text-sm text-coffee-600">
              Add any certifications your farm has earned (Organic, Fair Trade, Rainforest Alliance, UTZ, 4C, etc.)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard/farmer')}
              className="px-6 py-3 border border-gray-300 text-coffee-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
