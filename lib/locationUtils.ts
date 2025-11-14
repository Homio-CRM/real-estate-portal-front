import { Tables } from "../types/database";

export interface Location {
  lat: number;
  lng: number;
}

type ListingSearchRow = Tables<"listing_search">;
type LaunchSearchRow = Tables<"launch_search">;
type SearchEntity = ListingSearchRow | LaunchSearchRow;
type SearchEntityWithCoordinates<T extends SearchEntity> = T & {
  latitude: number;
  longitude: number;
};

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function hasCoordinates<T extends SearchEntity>(entity: T): entity is SearchEntityWithCoordinates<T> {
  const entityWithCoords = entity as T & { latitude?: unknown; longitude?: unknown };
  return typeof entityWithCoords.latitude === "number" && typeof entityWithCoords.longitude === "number";
}

export function getNearbyProperties<T extends SearchEntity>(
  properties: T[],
  userLocation: Location,
  maxDistance: number = 10
): SearchEntityWithCoordinates<T>[] {
  const entitiesWithDistance = properties
    .filter(hasCoordinates)
    .map(entity => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        entity.latitude,
        entity.longitude
      );
      return { entity, distance };
    })
    .filter(item => item.distance <= maxDistance);

  entitiesWithDistance.sort((a, b) => a.distance - b.distance);

  return entitiesWithDistance.map(item => item.entity);
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}