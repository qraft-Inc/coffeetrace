'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { Users, Search, UserPlus, Eye, EyeOff, CheckCircle, MapPin, Loader2, X, Pencil, Trash2 } from 'lucide-react';

export default function CoopFarmersPage() {
  const { data: session } = useSession();
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    farmSize: '',
    farmSizeUnit: 'acres',
    district: '',
    region: '',
    country: 'Uganda',
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    farmSize: '',
    farmSizeUnit: 'acres',
    district: '',
    region: '',
    country: 'Uganda',
  });

  useEffect(() => {
    fetchFarmers();
  }, [session?.user?.cooperativeId]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (session?.user?.cooperativeId) {
        params.set('cooperativeId', session.user.cooperativeId);
      }
      const res = await fetch(`/api/farmers?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load farmers');
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.farmers || [];
      setFarmers(list);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (farmer) => {
    if (farmer.status) return farmer.status;
    if (farmer.verificationStatus) return farmer.verificationStatus === 'verified' ? 'active' : farmer.verificationStatus;
    return 'active';
  };

  const formatFarmSize = (farmer) => {
    if (!farmer?.farmSize) return 'N/A';
    const sizeNumber = Number(farmer.farmSize);
    const unit = farmer.farmSizeUnit || 'acres';
    const acres = unit === 'hectares' ? sizeNumber * 2.47105 : sizeNumber;
    return `${acres.toFixed(1)} acres`;
  };

  const formatLocation = (farmer) => {
    const loc = farmer?.location;
    if (!loc) return 'N/A';
    if (typeof loc === 'string') return loc;
    const parts = [loc.district, loc.region, loc.country].filter(Boolean);
    if (parts.length) return parts.join(', ');
    if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      return `${loc.coordinates[1]?.toFixed ? loc.coordinates[1].toFixed(4) : loc.coordinates[1]}, ${loc.coordinates[0]?.toFixed ? loc.coordinates[0].toFixed(4) : loc.coordinates[0]}`;
    }
    return 'N/A';
  };

  const filteredFarmers = farmers.filter(farmer => {
    const nameMatch = (farmer.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const locationText = typeof farmer.location === 'string'
      ? farmer.location
      : `${farmer.location?.district || ''} ${farmer.location?.region || ''}`;
    const locationMatch = (locationText || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || locationMatch;
    const matchesFilter = filterStatus === 'all' || getStatus(farmer) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const totalLots = farmers.reduce((sum, f) => sum + (f.totalLots || 0), 0);
  const totalFarmArea = farmers.reduce((sum, f) => {
    if (!f.farmSize) return sum;
    const sizeNumber = Number(f.farmSize);
    const acres = (f.farmSizeUnit === 'hectares') ? sizeNumber * 2.47105 : sizeNumber;
    return sum + acres;
  }, 0);

  const handleAddFarmer = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'farmer',
        farmSize: formData.farmSize ? Number(formData.farmSize) : 0,
        farmSizeUnit: formData.farmSizeUnit,
        address: {
          district: formData.district,
          region: formData.region,
          country: formData.country,
        },
        cooperativeId: session?.user?.cooperativeId,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add farmer');
      }

      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        farmSize: '',
        farmSizeUnit: 'acres',
        district: '',
        region: '',
        country: 'Uganda',
      });
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEdit = (farmer) => {
    setEditTarget(farmer);
    setEditData({
      name: farmer.name || '',
      email: farmer.userId?.email || farmer.email || '',
      phone: farmer.userId?.phone || farmer.phone || '',
      farmSize: farmer.farmSize || '',
      farmSizeUnit: farmer.farmSizeUnit || 'acres',
      district: farmer.address?.district || '',
      region: farmer.address?.region || '',
      country: farmer.address?.country || 'Uganda',
    });
    setError('');
    setShowEditModal(true);
  };

  const handleEditFarmer = async (e) => {
    e.preventDefault();
    if (!editTarget?._id) {
      setShowEditModal(false);
      return;
    }
    setError('');
    setEditLoading(true);
    try {
      const payload = {
        name: editData.name,
        phone: editData.phone,
        farmSize: editData.farmSize ? Number(editData.farmSize) : 0,
        farmSizeUnit: editData.farmSizeUnit,
        address: {
          district: editData.district,
          region: editData.region,
          country: editData.country,
        },
      };

      const res = await fetch(`/api/farmers/${editTarget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update farmer');
      }

      setShowEditModal(false);
      setEditTarget(null);
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (farmer) => {
    setDeleteTarget(farmer);
    setError('');
    setShowDeleteConfirm(true);
  };

  const handleDeleteFarmer = async () => {
    if (!deleteTarget?._id) {
      setShowDeleteConfirm(false);
      return;
    }
    setDeleteLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/farmers/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete farmer');
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <RequireAuth allowedRoles={['coopAdmin']}>
      <DashboardLayout title="Cooperative Farmers">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Farmers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{farmers.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {farmers.filter(f => getStatus(f) === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Lots</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalLots}</p>
                </div>
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Farm Area</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalFarmArea.toFixed(1)} acres</p>
                </div>
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Actions and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add Farmer
              </button>
            </div>
          </div>

          {/* Farmers Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="md:hidden divide-y divide-gray-200">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading farmers...</div>
              ) : filteredFarmers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No farmers found</div>
              ) : (
                filteredFarmers.map((farmer) => (
                  <div key={farmer._id || farmer.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{farmer.name}</div>
                        <div className="text-xs text-gray-500 break-all">{farmer.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center justify-between"><span className="text-gray-500">Location:</span><span className="ml-2 text-right">{formatLocation(farmer)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Farm Size:</span><span className="ml-2 text-right">{formatFarmSize(farmer)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Total Lots:</span><span className="ml-2 text-right">{farmer.totalLots || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Status:</span><span className="ml-2 text-right"><span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusColor(getStatus(farmer))}`}>{getStatus(farmer)}</span></span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-500">Joined:</span><span className="ml-2 text-right">{farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button className="text-green-600 hover:text-green-900 font-medium flex items-center gap-1 text-sm">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => openEdit(farmer)}
                        className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1 text-sm"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(farmer)}
                        className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Lots</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Loading farmers...
                      </td>
                    </tr>
                  ) : filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No farmers found
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <tr key={farmer._id || farmer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                              <div className="text-xs text-gray-500">{farmer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatLocation(farmer)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFarmSize(farmer)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farmer.totalLots || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatusColor(getStatus(farmer))}`}>
                            {getStatus(farmer)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <button className="text-green-600 hover:text-green-900 font-medium flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => openEdit(farmer)}
                              className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(farmer)}
                              className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Add Farmer</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddFarmer} className="px-6 py-4 space-y-4">
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                    <div className="relative mt-1">
                      <input
                        required
                        minLength={8}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Share this password with the farmer; they can reset later.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Farm Size (acres)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.farmSize}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save Farmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Edit Farmer</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEditFarmer} className="px-6 py-4 space-y-4">
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      required
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Farm Size (acres)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editData.farmSize}
                      onChange={(e) => setEditData({ ...editData, farmSize: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={editData.district}
                      onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Region</label>
                    <input
                      type="text"
                      value={editData.region}
                      onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={editData.country}
                      onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
                  >
                    {editLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Delete Farmer</h3>
                <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm text-gray-700">
                <p>Are you sure you want to delete this farmer?</p>
                <p className="font-semibold">{deleteTarget?.name}</p>
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100">{error}</div>}
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteFarmer}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
                >
                  {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RequireAuth>
  );
}
