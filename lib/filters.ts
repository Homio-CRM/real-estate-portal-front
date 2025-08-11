import { URLSearchParams } from "url";

export type Filters = {
  tipo: string;
  localizacao: string;
  operacao: string;
  bairro?: string;
};

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): Filters {
  return {
    tipo: searchParams.get("tipo") || "",
    localizacao: searchParams.get("localizacao") || "",
    operacao: searchParams.get("operacao") || "todos",
    bairro: searchParams.get("bairro") || "",
  };
}

export function validateFilters(filters: Filters): { isValid: boolean; cityId?: number } {
  if (!filters.localizacao) {
    return { isValid: false };
  }
  
  const cityId = Number(filters.localizacao);
  if (!cityId) {
    return { isValid: false };
  }
  
  return { isValid: true, cityId };
}

export function getTransactionType(operacao: string): "sale" | "rent" | "all" {
  if (operacao === "alugar") return "rent";
  if (operacao === "comprar") return "sale";
  return "all";
} 