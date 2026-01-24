'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import { Plus, Search, X, Trash2, Edit, Loader2, DollarSign, TrendingUp, Users as UsersIcon } from 'lucide-react';

const PARTNER_TYPES = {
  sacco: { label: 'SACCO', color: 'blue' },
  vsla: { label: 'VSLA', color: 'green' },
  bank: { label: 'Bank', color: 'purple' },
  mfi: { label: 'Microfinance', color: 'orange' },
  ngo: { label: 'NGO', color: 'indigo' },
  other: { label: 'Other', color: 'gray' },
};

export default function CoopFinancePage() {
  const { data: session } = useSession();
  const [partners, setPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    partnerType: 'sacco',
    description: '',
    email: '',
    phone: '',
    website: '',
    district: '',
    country: '',
    maxLoanAmount: '',
    interestRate: '',
    processingFee: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  useEffect(() => {
    fetchPartners();
  }, [session?.user?.cooperativeId]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (session?.user?.cooperativeId) {
        params.set('cooperativeId', session.user.cooperativeId);
      }
      const res = await fetch(`/api/finance-partners?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load partners');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.partners || [];
      setPartners(list);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const nameMatch = (partner.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = !filterType || partner.partnerType === filterType;
    return nameMatch && typeMatch;
  });

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        partnerType: formData.partnerType,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        location: {
          district: formData.district,
          country: formData.country,
        },
        maxLoanAmount: parseFloat(formData.maxLoanAmount) || 0,
        processingFee: parseFloat(formData.processingFee) || 0,
        loanProducts: formData.interestRate ? [{
          name: `Standard ${PARTNER_TYPES[formData.partnerType].label} Loan`,
          interestRate: parseFloat(formData.interestRate),
        }] : [],
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
        cooperativeId: session?.user?.cooperativeId,
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/finance-partners/${editingId}` : '/api/finance-partners';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${editingId ? 'update' : 'add'} partner`);
      }

      setShowAddModal(false);
      setEditingId(null);
      resetForm();
      await fetchPartners();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance-partners/${partnerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove partner');
      setDeleteConfirm(null);
      await fetchPartners();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      partnerType: 'sacco',
      description: '',
      email: '',
      phone: '',
      website: '',
      district: '',
      country: '',
      maxLoanAmount: '',
      interestRate: '',
      processingFee: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    });
  };

  const openEditModal = (partner) => {
    setEditingId(partner._id);
    setFormData({
      name: partner.name,
      partnerType: partner.partnerType,
      description: partner.description || '',
      email: partner.email || '',
      phone: partner.phone || '',
      website: partner.website || '',
      district: partner.location?.district || '',
      country: partner.location?.country || '',
      maxLoanAmount: partner.maxLoanAmount || '',
      interestRate: partner.loanProducts?.[0]?.interestRate || '',
      processingFee: partner.processingFee || '',
      contactName: partner.contactPerson?.name || '',
      contactPhone: partner.contactPerson?.phone || '',
      contactEmail: partner.contactPerson?.email || '',
    });
    setShowAddModal(true);
  };

  const stats = {
    totalPartners: partners.length,
    saccos: partners.filter(p => p.partnerType === 'sacco').length,
    vslas: partners.filter(p => p.partnerType === 'vsla').length,
    banks: partners.filter(p => p.partnerType === 'bank').length,
  };

  return (
    <RequireAuth allowedRoles={['coopAdmin']}>
      <DashboardLayout title="Cooperative Finance">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Partners</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPartners}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">SACCOs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.saccos}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">VSLAs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.vslas}</p>
                </div>
                <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Banks</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.banks}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="sacco">SACCO</option>
                <option value="vsla">VSLA</option>
                <option value="bank">Bank</option>
                <option value="mfi">Microfinance</option>
              </select>
              <button
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Partner
              </button>
            </div>
          </div>

          {/* Partners List */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading partners...</div>
              ) : filteredPartners.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No partners found</div>
              ) : (
                filteredPartners.map((partner) => (
                  <div key={partner._id} className="p-4 space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{partner.name}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded text-white bg-${PARTNER_TYPES[partner.partnerType]?.color}-600`}>
                          {PARTNER_TYPES[partner.partnerType]?.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{partner.description}</div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="ml-2">{partner.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Max Loan:</span><span className="ml-2">{partner.maxLoanAmount || 'N/A'}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button onClick={() => openEditModal(partner)} className="text-blue-600 hover:text-blue-900 font-medium text-sm flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(partner)} className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center gap-1">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Loan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        Loading partners...
                      </td>
                    </tr>
                  ) : filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No partners found
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner) => (
                      <tr key={partner._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full text-white bg-${PARTNER_TYPES[partner.partnerType]?.color}-600`}>
                            {PARTNER_TYPES[partner.partnerType]?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{partner.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-600">{partner.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.maxLoanAmount ? `${partner.maxLoanAmount.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.loanProducts?.[0]?.interestRate ? `${partner.loanProducts[0].interestRate}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <button onClick={() => openEditModal(partner)} className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1">
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(partner)} className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1">
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

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Partner' : 'Add Finance Partner'}</h3>
                <button onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddPartner} className="px-6 py-4 space-y-4">
                {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Organization Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Kampala SACCO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Type *</label>
                    <select
                      value={formData.partnerType}
                      onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sacco">SACCO (Savings & Credit Cooperative)</option>
                      <option value="vsla">VSLA (Village Savings & Loan Association)</option>
                      <option value="bank">Bank</option>
                      <option value="mfi">Microfinance Institution</option>
                      <option value="ngo">NGO/Non-profit</option>
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
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="2"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of services offered"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Loan Amount</label>
                    <input
                      type="number"
                      value={formData.maxLoanAmount}
                      onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.processingFee}
                      onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="sm:col-span-2 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Person</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />} {editingId ? 'Update' : 'Add'} Partner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-lg">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Remove Finance Partner</h3>
                <p className="text-gray-600">
                  Are you sure you want to remove <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
                    onClick={() => handleDeletePartner(deleteConfirm._id)}
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
