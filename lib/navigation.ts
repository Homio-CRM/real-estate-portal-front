export function buildSearchParams(filters: Record<string, string>): string {
  return new URLSearchParams(filters).toString();
}

export function buildListingsUrl(filters: Record<string, string>): string {
  const params = buildSearchParams(filters);
  return `/listings?${params}`;
} 