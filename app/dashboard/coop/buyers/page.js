'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { Users, Search, UserPlus, Eye, Loader2, X, Pencil, Trash2, Globe, MapPin } from 'lucide-react';

export default function CoopBuyersPage() {
  const { data: session } = useSession();
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: 'roaster',
    email: '',
    phone: '',
    website: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchBuyers();
  }, [session?.user?.cooperativeId]);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (session?.user?.cooperativeId) {
        params.set('cooperativeId', session.user.cooperativeId);
      }
      const res = await fetch(`/api/buyers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load buyers');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.buyers || [];
      setBuyers(list);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const nameMatch = (buyer.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = (buyer.businessType || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || typeMatch;
  });

  const handleAddBuyer = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const payload = {
        companyName: formData.companyName,
        businessType: formData.businessType,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: {
          city: formData.city,
          country: formData.country,
        },
        cooperativeId: session?.user?.cooperativeId,
      };

      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add buyer');
      }

      setShowAddModal(false);
      setFormData({
        companyName: '',
        businessType: 'roaster',
        email: '',
        phone: '',
        website: '',
        city: '',
        country: '',
      });
      await fetchBuyers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteBuyer = async (buyerId) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove buyer');
      setDeleteConfirm(null);
      await fetchBuyers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <RequireAuth allowedRoles={['coopAdmin']}>
      <DashboardLayout title="Cooperative Buyers">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Buyers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{buyers.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Roasters</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{buyers.filter(b => b.businessType === 'roaster').length}</p>
                </div>
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Exporters</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{buyers.filter(b => b.businessType === 'exporter').length}</p>
                </div>
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Actions and Search */}
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add Buyer
              </button>
            </div>
          </div>

          {/* Buyers List */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading buyers...</div>
              ) : filteredBuyers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No buyers found</div>
              ) : (
                filteredBuyers.map((buyer) => (
                  <div key={buyer._id} className="p-4 space-y-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{buyer.companyName}</div>
                      <div className="text-xs text-gray-500 capitalize">{buyer.businessType}</div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="ml-2 text-right break-all">{buyer.email || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="ml-2 text-right">{buyer.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="ml-2 text-right">{buyer.address?.city || 'N/A'}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center gap-1" onClick={() => setDeleteConfirm(buyer)}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        Loading buyers...
                      </td>
                    </tr>
                  ) : filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No buyers found
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map((buyer) => (
                      <tr key={buyer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{buyer.companyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                            {buyer.businessType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.address?.city || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <button className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1" onClick={() => setDeleteConfirm(buyer)}>
                              <Trash2 className="h-4 w-4" />
                              Remove
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
                <h3 className="text-lg font-semibold">Add Buyer</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddBuyer} className="px-6 py-4 space-y-4">
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      required
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="roaster">Roaster</option>
                      <option value="exporter">Exporter</option>
                      <option value="trader">Trader</option>
                      <option value="retailer">Retailer</option>
                      <option value="cafe">Café</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />} Add Buyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-lg">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Remove Buyer</h3>
                <p className="text-gray-600">
                  Are you sure you want to remove <strong>{deleteConfirm.companyName}</strong> from your buyer network? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBuyer(deleteConfirm._id)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
                  >
                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RequireAuth>
  );
}
