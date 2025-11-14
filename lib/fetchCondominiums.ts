import { CondominiumCard } from "../types/listings";

export type FetchCondominiumsParams = {
  cityId: number;
  limit?: number;
  offset?: number;
};

export async function fetchCondominiums(params: FetchCondominiumsParams): Promise<CondominiumCard[]> {


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


  const fullUrl = `/api/condominium?${searchParams.toString()}`;


  try {
    const response = await fetch(fullUrl);


    if (!response.ok) {
      console.error("Response not ok:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();


    return data;
  } catch (error) {
    console.error("Error fetching condominiums:", error);

    throw error;
  }
}

export async function fetchCondominiumById(condominiumId: string) {
  const res = await fetch(`/api/condominium/${condominiumId}`);
  if (!res.ok) return null;
  return await res.json();
} 