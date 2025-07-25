import { FetchListingsParams } from "../types/api";

export async function fetchListings({ cityId, transactionType, tipo, limit = 30, offset = 0 }: FetchListingsParams) {
  const params = new URLSearchParams({
    cityId: String(cityId),
    transactionType,
    limit: String(limit),
    offset: String(offset),
  });
  if (tipo) params.append("tipo", tipo);
  const res = await fetch(`/api/listing?${params.toString()}`);
  if (!res.ok) return [];
  return await res.json();
} 