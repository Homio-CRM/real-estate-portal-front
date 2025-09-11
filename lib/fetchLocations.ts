import type { CityAutocomplete, NeighborhoodAutocomplete } from "../types/components";

export type LocationResult = {
  neighborhoods: NeighborhoodAutocomplete[];
  cities: CityAutocomplete[];
};

export async function fetchLocationById(id: string, type: string): Promise<CityAutocomplete | null> {
  try {
    const res = await fetch(`/api/locations?id=${id}&type=${type}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchLocationsByQuery(query: string): Promise<LocationResult> {
  try {
    const res = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      if (res.status === 404) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
      return { neighborhoods: [], cities: [] };
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
} 