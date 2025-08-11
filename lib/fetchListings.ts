import { FetchListingsParams } from "../types/api";
import { PropertyCard } from "../types/listings";

export async function fetchListings(params: FetchListingsParams): Promise<PropertyCard[]> {
  console.log("=== FETCH LISTINGS DEBUG ===");
  console.log("FetchListings params:", params);
  
  const searchParams = new URLSearchParams();
  
  if (params.cityId) {
    searchParams.append("cityId", params.cityId.toString());
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
  
  console.log("URL params:", searchParams.toString());
  
  const fullUrl = `/api/listing?${searchParams.toString()}`;
  console.log("Full URL:", fullUrl);
  
  try {
    const response = await fetch(fullUrl);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      console.error("Response not ok:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Response data length:", data.length);
    console.log("=== END FETCH LISTINGS DEBUG ===");
    
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    console.log("=== END FETCH LISTINGS DEBUG ===");
    throw error;
  }
}

export async function fetchListingById(listingId: string) {
  const res = await fetch(`/api/listing/${listingId}`);
  if (!res.ok) return null;
  return await res.json();
} 