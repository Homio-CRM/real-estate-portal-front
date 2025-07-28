import { FetchListingsParams } from "../types/api";

export async function fetchListings({ cityId, transactionType, tipo, bairro, limit = 30, offset = 0 }: FetchListingsParams) {
  const params = new URLSearchParams({
    cityId: String(cityId),
    transactionType,
    limit: String(limit),
    offset: String(offset),
  });
  if (tipo) params.append("tipo", tipo);
  if (bairro) params.append("bairro", bairro);
  const res = await fetch(`/api/listing?${params.toString()}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchListingById(listingId: string) {
  const res = await fetch(`/api/listing/${listingId}`);
  if (!res.ok) return null;
  return await res.json();
} 