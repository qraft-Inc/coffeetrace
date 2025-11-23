'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';

/**
 * FarmMapPolygon Component
 * Displays a farm's location and boundary polygon on a map
 * Uses Leaflet for interactive mapping
 */
export default function FarmMapPolygon({ 
  location, 
  farmBoundary, 
  farmName = 'Farm',
  showFullscreen = true,
  height = '400px'
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only load map in browser
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet
    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix for default marker icons in webpack
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapRef.current || mapInstanceRef.current) return;

        // Get coordinates
        let center = [0, 30]; // Default center
        let zoom = 6;

        if (location?.coordinates && location.coordinates.length === 2) {
          center = [location.coordinates[1], location.coordinates[0]]; // [lat, lon]
          zoom = 13;
        } else if (farmBoundary?.coordinates && farmBoundary.coordinates[0]?.length > 0) {
          // Use first coordinate of polygon
          const firstCoord = farmBoundary.coordinates[0][0];
          center = [firstCoord[1], firstCoord[0]];
          zoom = 14;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView(center, zoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker for farm location
        if (location?.coordinates && location.coordinates.length === 2) {
          const marker = L.marker([location.coordinates[1], location.coordinates[0]])
            .addTo(map);
          
          const popupContent = `
            <div class="p-2">
              <p class="font-bold text-coffee-900">${farmName}</p>
              ${location.district ? `<p class="text-sm text-coffee-600">${location.district}, ${location.country || ''}</p>` : ''}
            </div>
          `;
          marker.bindPopup(popupContent);
        }

        // Add polygon for farm boundary
        if (farmBoundary?.coordinates && farmBoundary.type === 'Polygon') {
          const polygonCoords = farmBoundary.coordinates[0].map(coord => [coord[1], coord[0]]);
          
          const polygon = L.polygon(polygonCoords, {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            weight: 2,
          }).addTo(map);

          // Calculate area
          const area = (L.GeometryUtil?.geodesicArea(polygon.getLatLngs()[0]) / 10000).toFixed(2);
          
          polygon.bindPopup(`
            <div class="p-2">
              <p class="font-bold text-coffee-900">${farmName} Boundary</p>
              ${area ? `<p class="text-sm text-coffee-600">Area: ${area} hectares</p>` : ''}
            </div>
          `);

          // Fit bounds to polygon
          map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
        }

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Handle resize
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, farmBoundary, farmName]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Invalidate size after state update
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  };

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!location && !farmBoundary) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No location data available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div 
        ref={mapRef} 
        style={{ height: isFullscreen ? '100vh' : height }}
        className="w-full rounded-lg border border-gray-300"
      />
      
      {showFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-gray-700" />
          ) : (
            <Maximize2 className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
