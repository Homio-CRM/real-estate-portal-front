import { fetchListings } from "./fetchListings";
import { PropertyCard } from "../types/listings";
import { getNearbyProperties, Location } from "./locationUtils";

export interface CascadeSearchResult {
  properties: PropertyCard[];
  searchLevel: "nearby" | "neighborhood" | "city" | "state" | "country";
  message: string;
}

async function getCityIdFromLocation(location: Location): Promise<number> {
  try {
    // Usar a API de geocoding para obter informações da cidade
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=10`
    );
    const data = await response.json();
    
    console.log("Geocoding data:", data);
    
    // Buscar o ID da cidade no banco de dados
    const cityResponse = await fetch(`/api/cities?name=${encodeURIComponent(data.address.city || data.address.town || 'Vitória')}`);
    const cities = await cityResponse.json();
    
    if (cities && cities.length > 0) {
      console.log("Cidade encontrada:", cities[0]);
      return cities[0].city_id;
    }
  } catch (error) {
    console.log("Erro ao obter cidade da localização:", error);
  }
  
  // Fallback para Vitória, ES
  return 3205309;
}

export async function searchPropertiesInCascade(
  userLocation: Location,
  limit: number = 3
): Promise<CascadeSearchResult> {
  
  console.log("Iniciando busca em cascata com localização:", userLocation);
  
  try {
    // Obter o ID da cidade baseado na localização
    const cityId = await getCityIdFromLocation(userLocation);
    console.log("City ID obtido:", cityId);
    
    // Busca com cityId correto
    const properties = await fetchListings({
      cityId: cityId,
      limit: limit,
      offset: 0,
      transactionType: "sale",
      tipo: "Apartamento"
    });
    
    console.log("Propriedades encontradas:", properties.length);
    
    if (properties.length > 0) {
      return {
        properties: properties,
        searchLevel: "city",
        message: "Imóveis em destaque"
      };
    }
  } catch (error) {
    console.log("Erro na busca:", error);
  }

  // Fallback - retornar array vazio com mensagem
  console.log("Retornando fallback vazio");
  return {
    properties: [],
    searchLevel: "country",
    message: "Nenhum imóvel disponível no momento"
  };
}