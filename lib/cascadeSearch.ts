import { fetchListings } from "./fetchListings";
import { PropertyCard } from "../types/listings";
import { getNearbyProperties, Location } from "./locationUtils";
import { CityResponse } from "../types/api";
import { getStateIdByName } from "./brazilianStates";

export interface CascadeSearchResult {
  properties: PropertyCard[];
  searchLevel: "nearby" | "neighborhood" | "city" | "state" | "country";
  message: string;
}

async function getCityIdFromLocation(location: Location): Promise<number> {
  try {
    const geocodingUrl = `/api/geocoding?lat=${location.lat}&lon=${location.lng}&zoom=10`;
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    const cityName = data.address?.municipality || data.address?.city || data.address?.town || 'Vitória';
    const stateName = data.address?.state;
    
    const stateId = stateName ? getStateIdByName(stateName) : null;
    
    const cityUrl = stateId 
      ? `/api/cities?name=${encodeURIComponent(cityName)}&stateId=${stateId}`
      : `/api/cities?name=${encodeURIComponent(cityName)}`;
    
    const cityResponse = await fetch(cityUrl);
    const cities: CityResponse[] = await cityResponse.json();
    
    if (cities && cities.length > 0) {
      return cities[0].id;
    }
  } catch (error) {
    console.error("Erro ao obter cidade da localização:", error);
  }
  
  return 3205309;
}

export async function searchPropertiesInCascade(
  userLocation: Location,
  limit: number = 3,
  transactionType: "sale" | "rent" | "all" = "sale",
  propertyType?: "Casa" | "Apartamento"
): Promise<CascadeSearchResult> {
  
  try {
    const cityId = await getCityIdFromLocation(userLocation);
    
    if (transactionType === "all") {
      // Buscar imóveis de venda e aluguel
      const [saleProperties, rentProperties] = await Promise.all([
        fetchListings({
          cityId: cityId,
          limit: Math.ceil(limit / 2),
          offset: 0,
          transactionType: "sale",
          tipo: propertyType
        }),
        fetchListings({
          cityId: cityId,
          limit: Math.ceil(limit / 2),
          offset: 0,
          transactionType: "rent",
          tipo: propertyType
        })
      ]);
      
      const allProperties = [...saleProperties, ...rentProperties];
      
      if (allProperties.length > 0) {
        return {
          properties: allProperties,
          searchLevel: "city",
          message: "Imóveis em destaque"
        };
      }
    } else {
      // Buscar apenas um tipo de transação
      const properties = await fetchListings({
        cityId: cityId,
        limit: limit,
        offset: 0,
        transactionType: transactionType,
        tipo: propertyType
      });
      
      if (properties.length > 0) {
        return {
          properties: properties,
          searchLevel: "city",
          message: "Imóveis em destaque"
        };
      }
    }
  } catch (error) {
    console.error("Erro na busca:", error);
  }

  return {
    properties: [],
    searchLevel: "country",
    message: "Nenhum imóvel disponível no momento"
  };
}