'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';
import {
  clearFarmDraft,
  loadFarmDraft,
  queueFarmSubmission,
  saveFarmDraft,
  syncQueuedFarmSubmissions,
} from '../../../../lib/offlineFarmQueue';

const FarmBoundaryLeaflet = dynamic(
  () => import('../../../../components/map/FarmBoundaryLeaflet'),
  { ssr: false }
);

const FarmsStatusLeaflet = dynamic(
  () => import('../../../../components/map/FarmsStatusLeaflet'),
  { ssr: false }
);

const initialForm = {
  farmerName: '',
  phone: '',
  farmName: '',
  cropType: 'Arabica',
  notes: '',
};

export default function FarmIdentityPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState(initialForm);
  const [boundary, setBoundary] = useState({ points: [], feature: null, areaHectares: 0, areaAcres: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [farms, setFarms] = useState([]);
  const [syncInfo, setSyncInfo] = useState({ synced: 0, failed: 0 });
  const [statusText, setStatusText] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [moderatingId, setModeratingId] = useState('');
  const [moderationDrafts, setModerationDrafts] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [selectedOwnerUserId, setSelectedOwnerUserId] = useState('');

  const completionChecks = useMemo(() => {
    return {
      boundary: Boolean(boundary.feature),
      owner: Boolean(selectedOwnerUserId),
      details: Boolean(form.farmerName && form.farmName && form.cropType),
    };
  }, [boundary.feature, form.cropType, form.farmName, form.farmerName, selectedOwnerUserId]);

  const canSubmit = completionChecks.boundary && completionChecks.owner && completionChecks.details;

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const onlineHandler = async () => {
      setIsOnline(true);
      const result = await syncQueuedFarmSubmissions();
      setSyncInfo(result);
      if (result.synced > 0) {
        setStatusText(`Synced ${result.synced} offline farm record(s).`);
        fetchFarms();
      }
    };

    const offlineHandler = () => setIsOnline(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  useEffect(() => {
    fetchFarms();
    restoreDraft();
  }, []);

  useEffect(() => {
    if (!session?.user?.cooperativeId) return;

    const loadFarmers = async () => {
      try {
        const response = await fetch(`/api/farmers?cooperativeId=${session.user.cooperativeId}&limit=200`);
        if (!response.ok) return;
        const data = await response.json();
        setFarmers(data.farmers || []);
      } catch (error) {
        // Ignore farmer list fetch failures and keep manual input path.
      }
    };

    loadFarmers();
  }, [session?.user?.cooperativeId]);

  useEffect(() => {
    saveFarmDraft({ form, boundary }).catch(() => {
      // Ignore draft persistence failures.
    });
  }, [boundary, form]);

  const restoreDraft = async () => {
    const draft = await loadFarmDraft();
    if (!draft) return;

    if (draft.form) setForm(draft.form);
    if (draft.boundary) setBoundary(draft.boundary);
  };

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      if (!response.ok) return;
      const data = await response.json();
      const nextFarms = data.farms || [];
      setFarms(nextFarms);
      setModerationDrafts((prev) => {
        const next = { ...prev };
        nextFarms.forEach((farm) => {
          if (next[farm._id]) return;
          next[farm._id] = {
            status: farm.status || 'pending',
            moderationNotes: farm.moderationNotes || '',
          };
        });
        return next;
      });
    } catch (error) {
      // Ignore map refresh failures in UI state.
    }
  };

  const updateFarmStatus = async (farmId) => {
    const draft = moderationDrafts[farmId];
    if (!draft) return;

    setModeratingId(farmId);
    setStatusText('');

    try {
      const response = await fetch(`/api/farms/${farmId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: draft.status,
          moderationNotes: draft.moderationNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update farm status');
      }

      setStatusText('Farm moderation status updated.');
      fetchFarms();
    } catch (error) {
      setStatusText('Could not update status. Please retry.');
    } finally {
      setModeratingId('');
    }
  };

  const uploadImages = async () => {
    if (!images.length) return [];

    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    const uploadResponse = await fetch('/api/uploads/farm-images', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload one or more images');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.urls || [];
  };

  const submitFarm = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const payload = {
      ...form,
      area: boundary.areaHectares,
      polygon: boundary.feature,
      images: [],
      ownerUserId: selectedOwnerUserId || undefined,
    };

    setSaving(true);
    setStatusText('');

    try {
      if (!isOnline) {
        await queueFarmSubmission({ payload });
        setStatusText('Saved offline. The farm will sync when internet returns.');
        return;
      }

      setUploading(true);
      payload.images = await uploadImages();
      setUploading(false);

      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save farm');
      }

      setStatusText('Farm saved successfully.');
      setForm(initialForm);
      setSelectedOwnerUserId('');
      setImages([]);
      setBoundary({ points: [], feature: null, areaHectares: 0, areaAcres: 0 });
      await clearFarmDraft();
      fetchFarms();
    } catch (error) {
      await queueFarmSubmission({ payload });
      setStatusText('Submission queued due to network or server issue. It will retry later.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <RequireAuth requiredRole="coopAdmin">
      <DashboardLayout title="Farm Identity & Mapping">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-28 sm:px-6 sm:pb-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Farm Identity & Mapping</h1>
            <p className="mt-1 text-sm text-gray-600">
              Draw farm boundaries, capture assisted GPS tracks, calculate area, attach farmer details, and save in GeoJSON.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {(syncInfo.synced > 0 || syncInfo.failed > 0) && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
                  Sync result: {syncInfo.synced} success / {syncInfo.failed} failed
                </span>
              )}
            </div>
          </div>

          <form id="farm-identity-form" onSubmit={submitFarm} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">1. Draw Boundary</h2>
                <FarmBoundaryLeaflet onBoundaryChange={setBoundary} initialPoints={boundary.points} />
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">2. Farm Records Map</h2>
                <FarmsStatusLeaflet farms={farms} />

                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Moderate Farm Records</h3>
                  {!farms.length && (
                    <p className="text-xs text-gray-500">No farm records available yet.</p>
                  )}

                  {farms.map((farm) => (
                    <div key={farm._id} className="rounded-md border border-gray-200 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{farm.farmName || 'Farm'}</p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          Current: {farm.status || 'pending'}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <select
                          value={moderationDrafts[farm._id]?.status || 'pending'}
                          onChange={(e) => {
                            const value = e.target.value;
                            setModerationDrafts((prev) => ({
                              ...prev,
                              [farm._id]: {
                                ...(prev[farm._id] || {}),
                                status: value,
                              },
                            }));
                          }}
                          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="pending">pending</option>
                          <option value="verified">verified</option>
                          <option value="rejected">rejected</option>
                        </select>

                        <input
                          value={moderationDrafts[farm._id]?.moderationNotes || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setModerationDrafts((prev) => ({
                              ...prev,
                              [farm._id]: {
                                ...(prev[farm._id] || {}),
                                moderationNotes: value,
                              },
                            }));
                          }}
                          placeholder="Moderation note (optional)"
                          className="sm:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => updateFarmStatus(farm._id)}
                        disabled={moderatingId === farm._id}
                        className="mt-2 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {moderatingId === farm._id ? 'Updating...' : 'Save moderation'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">3. Farmer and Farm Details</h2>
                <div className="space-y-3">
                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Assign Farmer Profile (Ownership)</span>
                    <select
                      value={selectedOwnerUserId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedOwnerUserId(value);

                        const selectedFarmer = farmers.find((farmer) => {
                          const user = farmer.userId;
                          const userId = typeof user === 'object' ? user?._id : user;
                          return userId === value;
                        });

                        if (!selectedFarmer) return;

                        setForm((prev) => ({
                          ...prev,
                          farmerName: selectedFarmer.name || prev.farmerName,
                          phone: selectedFarmer.phone || selectedFarmer.userId?.phone || prev.phone,
                        }));
                      }}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="" disabled>Select a farmer profile</option>
                      {farmers.map((farmer) => {
                        const user = farmer.userId;
                        const userId = typeof user === 'object' ? user?._id : user;
                        return (
                          <option key={farmer._id} value={userId || ''}>
                            {farmer.name} {user?.email ? `(${user.email})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Required: each mapped farm must be assigned to a farmer for ownership visibility.
                    </p>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Farmer Name</span>
                    <input
                      value={form.farmerName}
                      onChange={(e) => setForm((prev) => ({ ...prev, farmerName: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Phone Number</span>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Farm Name</span>
                    <input
                      value={form.farmName}
                      onChange={(e) => setForm((prev) => ({ ...prev, farmName: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Crop Type</span>
                    <select
                      value={form.cropType}
                      onChange={(e) => setForm((prev) => ({ ...prev, cropType: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="Arabica">Arabica</option>
                      <option value="Robusta">Robusta</option>
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Notes</span>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">4. Photos</h2>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="block w-full text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">{images.length} image(s) selected.</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">5. Area Summary</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Hectares</dt>
                    <dd className="font-semibold">{boundary.areaHectares.toFixed(4)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Acres</dt>
                    <dd className="font-semibold">{boundary.areaAcres.toFixed(4)}</dd>
                  </div>
                </dl>

                <div className="mt-3 hidden grid-cols-3 gap-2 text-[11px] sm:grid">
                  <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.boundary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {completionChecks.boundary ? '[x]' : '[ ]'} Boundary
                  </span>
                  <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.owner ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {completionChecks.owner ? '[x]' : '[ ]'} Farmer
                  </span>
                  <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.details ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {completionChecks.details ? '[x]' : '[ ]'} Details
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || saving}
                  className="mt-4 hidden w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-green-700 sm:block"
                >
                  {saving ? (uploading ? 'Uploading photos...' : 'Saving farm...') : 'Save Farm'}
                </button>

                {statusText && (
                  <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">{statusText}</p>
                )}
              </div>
            </div>
          </form>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="mb-2 grid grid-cols-3 gap-2 text-[11px]">
                <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.boundary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {completionChecks.boundary ? '[x]' : '[ ]'} Boundary
                </span>
                <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.owner ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {completionChecks.owner ? '[x]' : '[ ]'} Farmer
                </span>
                <span className={`rounded px-2 py-1 text-center font-medium ${completionChecks.details ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {completionChecks.details ? '[x]' : '[ ]'} Details
                </span>
              </div>

              <button
                type="submit"
                form="farm-identity-form"
                disabled={!canSubmit || saving}
                className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (uploading ? 'Uploading photos...' : 'Saving farm...') : 'Save Farm'}
              </button>
              {!canSubmit && (
                <p className="mt-2 text-center text-xs text-gray-600">
                  Complete all three steps above to save.
                </p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
