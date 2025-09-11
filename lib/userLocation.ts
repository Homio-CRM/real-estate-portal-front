export interface UserLocation {
  city: string;
  state: string;
  city_id: number | null;
  state_id: number | null;
  country: string;
}

export async function getUserLocation(): Promise<UserLocation> {
  try {
    const response = await fetch('/api/geolocation');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const location = await response.json();
    return location;
  } catch (error) {
    console.error('Error fetching user location:', error);
    // Fallback para Vitória - ES
    return {
      city: "Vitória",
      state: "ES",
      city_id: 3205309,
      state_id: 32,
      country: "BR"
    };
  }
}
