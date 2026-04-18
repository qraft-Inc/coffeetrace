import * as turf from '@turf/turf';

export function closeRing(points = []) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

export function isPolygonDrawable(points = []) {
  return Array.isArray(points) && points.length >= 3;
}

export function pointsToFarmFeature(points = []) {
  if (!isPolygonDrawable(points)) return null;

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [closeRing(points)],
    },
    properties: {},
  };
}

export function calculateAreaMetrics(feature) {
  if (!feature?.geometry || feature.geometry.type !== 'Polygon') {
    return { squareMeters: 0, hectares: 0, acres: 0 };
  }

  const squareMeters = turf.area(feature);
  const hectares = squareMeters / 10000;
  const acres = hectares * 2.4710538147;

  return {
    squareMeters,
    hectares,
    acres,
  };
}
