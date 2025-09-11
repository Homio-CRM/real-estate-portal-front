import { FetchListingsParams } from "../types/api";
import { PropertyCard } from "../types/listings";

export async function fetchListings(params: FetchListingsParams): Promise<PropertyCard[]> {
  
  const searchParams = new URLSearchParams();
  
  if (params.cityId) {
    searchParams.append("cityId", params.cityId.toString());
  }
  
  if (params.stateId) {
    searchParams.append("stateId", params.stateId.toString());
  }
  
  if (params.transactionType) {
    searchParams.append("transactionType", params.transactionType);
  }
  
  if (params.tipo) {
    searchParams.append("tipo", params.tipo);
  }
  
  if (params.bairro) {
    searchParams.append("bairro", params.bairro);
  }
  
  if (params.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  
  if (params.offset) {
    searchParams.append("offset", params.offset.toString());
  }
  
  if (params.isLaunch !== undefined) {
    searchParams.append("isLaunch", params.isLaunch.toString());
  }
  
  if (params.useLocationPriority !== undefined) {
    searchParams.append("useLocationPriority", params.useLocationPriority.toString());
  }
  
  const fullUrl = `/api/listing?${searchParams.toString()}`;
  
  try {
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      console.error("❌ [FETCH LISTINGS] Response not ok:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ [FETCH LISTINGS] Error fetching listings:", error);
    throw error;
  }
}

export async function fetchListingById(listingId: string) {
  const res = await fetch(`/api/listing/${listingId}`);
  if (!res.ok) return null;
  return await res.json();
} 