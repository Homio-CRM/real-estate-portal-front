import { CondominiumCard } from "../types/listings";

export type FetchCondominiumsParams = {
  cityId: number;
  limit?: number;
  offset?: number;
};

export async function fetchCondominiums(params: FetchCondominiumsParams): Promise<CondominiumCard[]> {
  console.log("=== FETCH CONDOMINIUMS DEBUG ===");
  console.log("FetchCondominiums params:", params);
  
  const searchParams = new URLSearchParams();
  
  if (params.cityId) {
    searchParams.append("cityId", params.cityId.toString());
  }
  
  if (params.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  
  if (params.offset) {
    searchParams.append("offset", params.offset.toString());
  }
  
  console.log("URL params:", searchParams.toString());
  
  const fullUrl = `/api/condominium?${searchParams.toString()}`;
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
    console.log("=== END FETCH CONDOMINIUMS DEBUG ===");
    
    return data;
  } catch (error) {
    console.error("Error fetching condominiums:", error);
    console.log("=== END FETCH CONDOMINIUMS DEBUG ===");
    throw error;
  }
}

export async function fetchCondominiumById(condominiumId: string) {
  const res = await fetch(`/api/condominium/${condominiumId}`);
  if (!res.ok) return null;
  return await res.json();
} 