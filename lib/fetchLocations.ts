import type { CityAutocomplete, NeighborhoodAutocomplete } from "../types/components";

export type LocationResult = {
  neighborhoods: NeighborhoodAutocomplete[];
  cities: CityAutocomplete[];
};

export async function fetchLocationById(id: string): Promise<CityAutocomplete | null> {
  try {
    const res = await fetch(`/api/locations?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchLocationsByQuery(query: string): Promise<LocationResult> {
  try {
    console.log('🔍 fetchLocationsByQuery: Iniciando busca para query:', query);
    const url = `/api/locations?q=${encodeURIComponent(query)}`;
    console.log('🌐 fetchLocationsByQuery: URL da requisição:', url);
    
    const res = await fetch(url);
    console.log('📡 fetchLocationsByQuery: Status da resposta:', res.status, res.statusText);
    
    if (!res.ok) {
      if (res.status === 404) {
        const errorData = await res.json();
        console.log('❌ fetchLocationsByQuery: Erro 404 - dados:', errorData);
        throw new Error(errorData.error);
      }
      console.log('⚠️ fetchLocationsByQuery: Resposta não OK, retornando arrays vazios');
      return { neighborhoods: [], cities: [] };
    }
    
    const result = await res.json();
    console.log('✅ fetchLocationsByQuery: Resultado recebido:', {
      neighborhoods: result.neighborhoods?.length || 0,
      cities: result.cities?.length || 0
    });
    return result;
  } catch (error) {
    console.error('💥 fetchLocationsByQuery: Erro capturado:', error);
    throw error;
  }
} 