export function buildSearchParams(filters: Record<string, string | string[]>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const cleaned = value.filter((item) => item !== undefined && item !== null && String(item).trim() !== "");
      if (cleaned.length > 0) {
        params.append(key, cleaned.join(","));
      }
    } else if (value && value !== "") {
      params.append(key, value);
    }
  });
  
  return params.toString();
}

export function buildListingsUrl(filters: Record<string, string | string[]>): string {
  const params = buildSearchParams(filters);
  return params.length > 0 ? `/listings?${params}` : "/listings";
}

export function buildResultsUrl(filters: Record<string, string | string[]>): string {
  const params = buildSearchParams(filters);
  return params.length > 0 ? `/results?${params}` : "/results";
}

export function buildLaunchesUrl(filters: Record<string, string | string[]>): string {
  const sanitized = { ...filters };

  if ("operacao" in sanitized) {
    delete sanitized.operacao;
  }

  const params = buildSearchParams(sanitized);
  return params.length > 0 ? `/launches?${params}` : "/launches";
} 