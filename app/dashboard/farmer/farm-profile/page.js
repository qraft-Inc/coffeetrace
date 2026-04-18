'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import RequireAuth from '../../../../components/dashboard/RequireAuth';

const FarmsStatusLeaflet = dynamic(
  () => import('../../../../components/map/FarmsStatusLeaflet'),
  { ssr: false }
);

function getStatusBadgeClass(status) {
  if (status === 'verified') return 'bg-green-100 text-green-700';
  if (status === 'rejected') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}

export default function FarmerFarmProfilePage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/farms');
        if (!response.ok) {
          throw new Error('Failed to load farm profile data');
        }

        const data = await response.json();
        setFarms(data.farms || []);
      } catch (fetchError) {
        setError('Unable to load your farm profile right now.');
      } finally {
        setLoading(false);
      }
    };

    loadFarms();
  }, []);

  return (
    <RequireAuth requiredRole="farmer">
      <DashboardLayout title="Farm Profile & Verification">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Farm Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your mapped farm land and track verification progress. This page is view-only.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Mapped Land Overview</h2>
            {loading ? (
              <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">Loading your mapped farms...</div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : (
              <FarmsStatusLeaflet farms={farms} />
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Verification Status</h2>

            {loading ? (
              <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">Loading verification records...</div>
            ) : !farms.length ? (
              <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                No farm records found yet. Your cooperative will map and submit your farm for verification.
              </div>
            ) : (
              <div className="space-y-3">
                {farms.map((farm) => (
                  <div key={farm._id} className="rounded-md border border-gray-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{farm.farmName || 'Farm'}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(farm.status)}`}>
                        {farm.status || 'pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">Farmer: {farm.farmerName || 'N/A'}</p>
                    <p className="mt-1 text-xs text-gray-600">Area: {Number(farm.area || 0).toFixed(3)} ha</p>
                    {farm.moderationNotes ? (
                      <p className="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-700">
                        Review note: {farm.moderationNotes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
