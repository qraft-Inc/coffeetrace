'use client';

import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet';

const DEFAULT_CENTER = [-1.9441, 30.0588];

function getStatusColors(status) {
  if (status === 'verified') {
    return { fillColor: '#22c55e', color: '#15803d' };
  }
  if (status === 'rejected') {
    return { fillColor: '#ef4444', color: '#b91c1c' };
  }
  return { fillColor: '#eab308', color: '#a16207' };
}

function FitToFarms({ farms }) {
  const map = useMap();

  useEffect(() => {
    if (!farms.length) return;

    const bounds = [];
    farms.forEach((farm) => {
      const ring = farm?.polygon?.geometry?.coordinates?.[0] || [];
      ring.forEach(([lng, lat]) => bounds.push([lat, lng]));
    });

    if (!bounds.length) return;
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [farms, map]);

  return null;
}

export default function FarmsStatusLeaflet({ farms = [], loading = false }) {
  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">Loading farms...</div>;
  }

  if (!farms.length) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">No farms saved yet.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={DEFAULT_CENTER} zoom={8} className="h-[300px] w-full sm:h-[420px]" scrollWheelZoom>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitToFarms farms={farms} />

          {farms.map((farm) => {
            const ring = farm?.polygon?.geometry?.coordinates?.[0] || [];
            if (!ring.length) return null;

            const positions = ring.map(([lng, lat]) => [lat, lng]);
            const statusStyle = getStatusColors(farm.status);

            return (
              <Polygon
                key={farm._id}
                positions={positions}
                pathOptions={{
                  color: statusStyle.color,
                  fillColor: statusStyle.fillColor,
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[220px] space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{farm.farmName || 'Farm'}</p>
                    <p className="text-xs text-gray-600">Farmer: {farm.farmerName || 'N/A'}</p>
                    <p className="text-xs text-gray-600">Status: {farm.status || 'pending'}</p>
                    <p className="text-xs text-gray-600">Area: {Number(farm.area || 0).toFixed(3)} ha</p>
                    {!!farm.images?.length && (
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {farm.images.slice(0, 2).map((src) => (
                          <img key={src} src={src} alt="Farm" className="h-16 w-full rounded object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </Polygon>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-500" /> verified</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-yellow-500" /> pending</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-500" /> rejected</span>
      </div>
    </div>
  );
}
