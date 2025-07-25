import type { CityAutocomplete } from "../types/components";

export async function fetchCityById(id: string): Promise<CityAutocomplete | null> {
  try {
    const res = await fetch(`/api/cities?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching city by ID:", error);
    return null;
  }
}

export async function fetchCitiesByQuery(query: string): Promise<CityAutocomplete[]> {
  try {
    const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching cities by query:", error);
    return [];
  }
} 