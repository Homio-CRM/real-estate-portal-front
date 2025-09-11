export interface Location {
  lat: number;
  lng: number;
}

export interface PropertyWithLocation {
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getNearbyProperties(properties: PropertyWithLocation[], userLocation: Location, maxDistance: number = 10): PropertyWithLocation[] {
  return properties
    .filter(property => {
      if (!property.latitude || !property.longitude) return false;
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        property.latitude,
        property.longitude
      );
      
      return distance <= maxDistance;
    })
    .sort((a, b) => {
      const distanceA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      );
      const distanceB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      );
      
      return distanceA - distanceB;
    });
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}