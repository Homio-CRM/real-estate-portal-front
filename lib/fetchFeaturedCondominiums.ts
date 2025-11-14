import { CondominiumCard } from "../types/listings";

export type FetchFeaturedCondominiumsParams = {
  cityId?: number;
  limit?: number;
  offset?: number;
  strictCityFilter?: boolean;
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
  
  if (params.strictCityFilter) {
    searchParams.append("strictCityFilter", "true");
  }
  
  const queryString = searchParams.toString();
  const fullUrl = queryString
    ? `/api/condominiums/featured?${queryString}`
    : "/api/condominiums/featured";
  
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
