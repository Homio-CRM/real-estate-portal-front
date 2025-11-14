import { FetchListingsParams } from "../types/api";
import { PropertyCard } from "../types/listings";

export async function fetchListings(params: FetchListingsParams): Promise<PropertyCard[]> {
  const searchParams = new URLSearchParams();
  
  if (params.cityId) {
    searchParams.append("cityId", params.cityId.toString());
  }
  
  if (params.transactionType) {
    searchParams.append("transactionType", params.transactionType);
  }
  
  if (params.tipo) {
    if (Array.isArray(params.tipo)) {
      searchParams.append("tipo", params.tipo.join(","));
    } else {
      searchParams.append("tipo", params.tipo);
    }
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
  
  const fullUrl = `/api/listing?${searchParams.toString()}`;
  
  try {
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchListingById(listingId: string) {
  const res = await fetch(`/api/listing/${listingId}`);
  if (!res.ok) return null;
  return await res.json();
} 