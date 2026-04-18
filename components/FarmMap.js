'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';

/**
 * FarmMap Component
 * Displays farm locations on a map using Leaflet + OpenStreetMap
 */
export default function FarmMap({ locations = [], center, zoom = 10, height = '400px' }) {
  useEffect(() => {
    L.Marker.prototype.options.icon = new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  }, []);

  const mapCenter = center ? [center[1], center[0]] : [0.3476, 32.5825];

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-lg border border-gray-200">
      <MapContainer center={mapCenter} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapToLocations locations={locations} />

        {locations.map((location, index) => {
          if (!location.coordinates || location.coordinates.length !== 2) return null;

          const [lng, lat] = location.coordinates;
          return (
            <Marker key={`${location.name || 'farm'}-${index}`} position={[lat, lng]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold">{location.name || 'Farm'}</h3>
                  {location.farmSize ? (
                    <p className="text-sm">
                      Size: {location.farmSizeUnit === 'hectares' ? (location.farmSize * 2.47105).toFixed(1) : location.farmSize} acres
                    </p>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function FitMapToLocations({ locations }) {
  const map = useMap();

  useEffect(() => {
    const points = locations
      .filter((loc) => loc.coordinates && loc.coordinates.length === 2)
      .map((loc) => [loc.coordinates[1], loc.coordinates[0]]);

    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [24, 24] });
  }, [locations, map]);

  return null;
}

/**
 * SimpleFarmMap Component
 * Lightweight fallback visualization component
 */
export function SimpleFarmMap({ locations = [], height = '400px' }) {
  return (
    <div
      style={{ height }}
      className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="20" cy="30" r="2" fill="currentColor" />
          <circle cx="50" cy="40" r="2" fill="currentColor" />
          <circle cx="70" cy="25" r="2" fill="currentColor" />
          <circle cx="40" cy="60" r="2" fill="currentColor" />
          <circle cx="80" cy="70" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="text-center z-10">
        <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <p className="text-green-700 font-semibold">
          {locations.length} {locations.length === 1 ? 'Farm' : 'Farms'}
        </p>
        <p className="text-sm text-green-600 mt-1">Map visualization</p>
      </div>
    </div>
  );
}
