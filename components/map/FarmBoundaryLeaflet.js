'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import { Crosshair, LocateFixed, Play, Plus, RotateCcw, Square, Trash2 } from 'lucide-react';
import * as turf from '@turf/turf';
import { calculateAreaMetrics, pointsToFarmFeature } from '../../lib/geojson';

const DEFAULT_CENTER = [-1.9441, 30.0588];

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickCapture({ onPointAdd }) {
  useMapEvents({
    click(event) {
      onPointAdd([event.latlng.lng, event.latlng.lat]);
    },
  });

  return null;
}

function FitBounds({ points }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.flyTo([points[0][1], points[0][0]], 17, { duration: 0.6 });
      return;
    }

    const latLngs = points.map(([lng, lat]) => [lat, lng]);
    map.fitBounds(latLngs, { padding: [24, 24] });
  }, [map, points]);

  return null;
}

export default function FarmBoundaryLeaflet({ initialPoints = [], onBoundaryChange }) {
  const [points, setPoints] = useState(initialPoints);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [tracking, setTracking] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [error, setError] = useState('');
  const [watchId, setWatchId] = useState(null);

  const polygonFeature = useMemo(() => pointsToFarmFeature(points), [points]);
  const areaMetrics = useMemo(() => calculateAreaMetrics(polygonFeature), [polygonFeature]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // Use default center when location permission is denied.
      }
    );
  }, []);

  useEffect(() => {
    if (!onBoundaryChange) return;

    onBoundaryChange({
      points,
      feature: polygonFeature,
      areaHectares: areaMetrics.hectares,
      areaAcres: areaMetrics.acres,
    });
  }, [areaMetrics.acres, areaMetrics.hectares, onBoundaryChange, points, polygonFeature]);

  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const addPoint = (point) => {
    setPoints((prev) => [...prev, point]);
  };

  const undoPoint = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const resetPolygon = () => {
    setPoints([]);
    setGpsAccuracy(null);
  };

  const addCurrentLocationPoint = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available on this device.');
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coord = [position.coords.longitude, position.coords.latitude];
        setGpsAccuracy(position.coords.accuracy || null);
        addPoint(coord);
      },
      (geoError) => {
        setError(geoError.message || 'Failed to get current location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available on this device.');
      return;
    }

    if (tracking) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatchId(null);
      setTracking(false);
      return;
    }

    setError('');
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const next = [position.coords.longitude, position.coords.latitude];
        setGpsAccuracy(position.coords.accuracy || null);

        setPoints((prev) => {
          if (!prev.length) return [next];
          const last = prev[prev.length - 1];
          const meters = turf.distance(turf.point(last), turf.point(next), { units: 'meters' });
          if (meters < 2) return prev;
          return [...prev, next];
        });
      },
      (geoError) => {
        setError(geoError.message || 'GPS tracking failed.');
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    setWatchId(id);
    setTracking(true);
  };

  const polygonLatLngs = points.map(([lng, lat]) => [lat, lng]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={mapCenter} zoom={15} className="h-[300px] w-full sm:h-[360px]" scrollWheelZoom>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickCapture onPointAdd={addPoint} />
          <FitBounds points={points} />

          {points.length >= 2 && <Polyline positions={polygonLatLngs} pathOptions={{ color: '#0f766e', weight: 2 }} />}
          {points.length >= 3 && (
            <Polygon
              positions={polygonLatLngs}
              pathOptions={{ color: '#15803d', weight: 2, fillColor: '#22c55e', fillOpacity: 0.25 }}
            />
          )}

          {points.map(([lng, lat], index) => (
            <Marker
              key={`${lng}-${lat}-${index}`}
              position={[lat, lng]}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const next = event.target.getLatLng();
                  setPoints((prev) => {
                    const updated = [...prev];
                    updated[index] = [next.lng, next.lat];
                    return updated;
                  });
                },
              }}
            />
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
        <button
          type="button"
          onClick={addCurrentLocationPoint}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2.5 text-sm hover:bg-gray-50 lg:w-auto"
        >
          <LocateFixed className="h-4 w-4" />
          Add current point
        </button>

        <button
          type="button"
          onClick={toggleTracking}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm lg:w-auto ${
            tracking
              ? 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {tracking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {tracking ? 'Stop GPS tracking' : 'Start GPS tracking'}
        </button>

        <button
          type="button"
          onClick={undoPoint}
          disabled={!points.length}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 lg:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          Undo last
        </button>

        <button
          type="button"
          onClick={resetPolygon}
          disabled={!points.length}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-50 lg:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Reset polygon
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-gray-500">Points</p>
          <p className="font-semibold text-gray-900">{points.length}</p>
        </div>
        <div>
          <p className="text-gray-500">Area (ha)</p>
          <p className="font-semibold text-gray-900">{areaMetrics.hectares.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-gray-500">Area (acres)</p>
          <p className="font-semibold text-gray-900">{areaMetrics.acres.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-gray-500">GPS accuracy</p>
          <p className="font-semibold text-gray-900">{gpsAccuracy ? `${Math.round(gpsAccuracy)} m` : 'N/A'}</p>
        </div>
      </div>

      {error && <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{error}</div>}

      <p className="flex items-center gap-2 text-xs text-gray-500">
        <Crosshair className="h-3.5 w-3.5" />
        Tap map to add boundary points. Drag markers to edit polygon in real time.
      </p>
      <p className="flex items-center gap-2 text-xs text-gray-500">
        <Plus className="h-3.5 w-3.5" />
        Polygon closes automatically when saved to GeoJSON.
      </p>
    </div>
  );
}
