import { CondominiumCard } from "../types/listings";

export type FetchFeaturedCondominiumsParams = {
  cityId?: number;
  limit?: number;
  offset?: number;
};

export async function fetchFeaturedCondominiums(params: FetchFeaturedCondominiumsParams = {}): Promise<CondominiumCard[]> {
  console.log("=== FETCH FEATURED CONDOMINIUMS DEBUG ===");
  console.log("FetchFeaturedCondominiums params:", params);
  
  const searchParams = new URLSearchParams();
  
  if (typeof params.cityId === "number") {
    searchParams.append("cityId", params.cityId.toString());
  }
  
  if (params.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  
  if (params.offset) {
    searchParams.append("offset", params.offset.toString());
  }
  
  console.log("URL params:", searchParams.toString());
  
  const queryString = searchParams.toString();
  const fullUrl = queryString
    ? `/api/condominiums/featured?${queryString}`
    : "/api/condominiums/featured";
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
    console.log("=== END FETCH FEATURED CONDOMINIUMS DEBUG ===");
    
    return data;
  } catch (error) {
    console.error("Error fetching featured condominiums:", error);
    console.log("=== END FETCH FEATURED CONDOMINIUMS DEBUG ===");
    throw error;
  }
}
