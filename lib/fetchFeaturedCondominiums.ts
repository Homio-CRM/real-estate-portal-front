import { CondominiumCard } from "../types/listings";

export type FetchFeaturedCondominiumsParams = {
  cityId?: number;
  limit?: number;
  offset?: number;
};

export async function fetchFeaturedCondominiums(params: FetchFeaturedCondominiumsParams = {}): Promise<CondominiumCard[]> {
  
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
  
  
  const queryString = searchParams.toString();
  const fullUrl = queryString
    ? `/api/condominiums/featured?${queryString}`
    : "/api/condominiums/featured";
  
  try {
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      console.error("Response not ok:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Error fetching featured condominiums:", error);
    throw error;
  }
}
