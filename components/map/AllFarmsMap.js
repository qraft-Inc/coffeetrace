'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Layers } from 'lucide-react';

/**
 * AllFarmsMap Component
 * Displays all farms with their locations and boundaries on a single map
 * Useful for admin dashboards and overview pages
 */
export default function AllFarmsMap({ 
  farmers = [],
  height = '600px',
  showControls = true
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    markers: true,
    polygons: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!farmers || farmers.length === 0) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map - center on Rwanda
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([-1.9403, 29.8739], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const bounds = [];
        const markers = [];
        const polygons = [];

        // Add each farmer to the map
        farmers.forEach((farmer) => {
          // Add marker
          if (farmer.location?.coordinates && farmer.location.coordinates.length === 2) {
            const coords = [farmer.location.coordinates[1], farmer.location.coordinates[0]];
            bounds.push(coords);

            const marker = L.marker(coords).addTo(map);
            marker.bindPopup(`
              <div class="p-2">
                <p class="font-bold text-coffee-900">${farmer.name}</p>
                <p class="text-sm text-coffee-600">${farmer.location.district || ''}, ${farmer.location.country || ''}</p>
                ${farmer.farmSize ? `<p class="text-xs text-gray-500 mt-1">${farmer.farmSize} ${farmer.farmSizeUnit || 'hectares'}</p>` : ''}
              </div>
            `);
            markers.push(marker);
          }

          // Add polygon
          if (farmer.farmBoundary?.coordinates && farmer.farmBoundary.type === 'Polygon') {
            const polygonCoords = farmer.farmBoundary.coordinates[0].map(coord => [coord[1], coord[0]]);
            
            const polygon = L.polygon(polygonCoords, {
              color: '#16a34a',
              fillColor: '#22c55e',
              fillOpacity: 0.2,
              weight: 2,
            }).addTo(map);

            polygon.bindPopup(`
              <div class="p-2">
                <p class="font-bold text-coffee-900">${farmer.name}</p>
                <p class="text-sm text-coffee-600">Farm Boundary</p>
              </div>
            `);
            polygons.push(polygon);

            // Add polygon bounds
            polygonCoords.forEach(coord => bounds.push(coord));
          }
        });

        // Fit map to show all farms
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        mapInstanceRef.current = { map, markers, polygons };
        setMapLoaded(true);

        const resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapRef.current);

        return () => {
          resizeObserver.disconnect();
          map.remove();
          mapInstanceRef.current = null;
        };
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map');
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [farmers]);

  // Toggle layer visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const { markers, polygons } = mapInstanceRef.current;

    markers?.forEach(marker => {
      if (visibleLayers.markers) {
        marker.addTo(mapInstanceRef.current.map);
      } else {
        marker.remove();
      }
    });

    polygons?.forEach(polygon => {
      if (visibleLayers.polygons) {
        polygon.addTo(mapInstanceRef.current.map);
      } else {
        polygon.remove();
      }
    });
  }, [visibleLayers]);

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!farmers || farmers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No farms to display</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-300"
      />

      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.markers}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, markers: e.target.checked }))}
              className="rounded text-primary-600"
            />
            <span className="text-sm text-gray-700">Markers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers.polygons}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, polygons: e.target.checked }))}
              className="rounded text-primary-600"
            />
            <span className="text-sm text-gray-700">Boundaries</span>
          </label>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-sm text-gray-600">Loading farms map...</p>
          </div>
        </div>
      )}

      <div className="mt-3 text-sm text-gray-600 text-center">
        Showing {farmers.length} farm{farmers.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
