'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/**
 * FarmMap Component
 * Displays farm locations on a map using Mapbox GL JS
 * 
 * Note: Requires NEXT_PUBLIC_MAPBOX_TOKEN in environment variables
 */
export default function FarmMap({ locations = [], center, zoom = 10, height = '400px' }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Mapbox token is available
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      setError('Mapbox token not configured');
      return;
    }

    // Only initialize map once
    if (map.current) return;

    // Dynamically import mapbox-gl
    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = mapboxToken;

      const defaultCenter = center || [32.5825, 0.3476]; // Uganda center
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: defaultCenter,
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add markers for locations
        locations.forEach((location) => {
          if (location.coordinates && location.coordinates.length === 2) {
            new mapboxgl.default.Marker({ color: '#16a34a' })
              .setLngLat(location.coordinates)
              .setPopup(
                new mapboxgl.default.Popup({ offset: 25 }).setHTML(
                  `<div class="p-2">
                    <h3 class="font-semibold">${location.name || 'Farm'}</h3>
                    ${location.farmSize ? `<p class="text-sm">Size: ${location.farmSizeUnit === 'hectares' ? (location.farmSize * 2.47105).toFixed(1) : location.farmSize} acres</p>` : ''}
                  </div>`
                )
              )
              .addTo(map.current);
          }
        });

        // Fit map to markers if multiple locations
        if (locations.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds();
          locations.forEach((loc) => {
            if (loc.coordinates && loc.coordinates.length === 2) {
              bounds.extend(loc.coordinates);
            }
          });
          map.current.fitBounds(bounds, { padding: 50 });
        }
      });
    }).catch((err) => {
      console.error('Failed to load Mapbox:', err);
      setError('Failed to load map');
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [locations, center, zoom]);

  if (error) {
    return (
      <div
        style={{ height }}
        className="bg-coffee-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-coffee-600">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Map will be available when Mapbox token is configured</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative rounded-lg overflow-hidden">
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-coffee-100 flex items-center justify-center">
          <div className="text-center text-coffee-600">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SimpleFarmMap Component
 * Fallback static map component when Mapbox is not available
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
