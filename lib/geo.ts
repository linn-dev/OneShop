export type Coords = { lat: number; lng: number };

export function hasCoords(item: { lat: number | null; lng: number | null }): item is {
  lat: number;
  lng: number;
} {
  return item.lat != null && item.lng != null;
}

/** Approximate distance in kilometers (haversine). */
export function distanceKm(from: Coords, to: Coords): number {
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function nearbySort<T extends { lat: number | null; lng: number | null }>(
  items: T[],
  origin: Coords,
): T[] {
  return [...items].sort((a, b) => {
    const aHas = hasCoords(a);
    const bHas = hasCoords(b);
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (!aHas && !bHas) return 0;
    return distanceKm(origin, a) - distanceKm(origin, b);
  });
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
