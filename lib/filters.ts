import { URLSearchParams } from "url";

export type Filters = {
  tipo: string;
  cidade: string;
  operacao: string;
  bairro?: string;
};

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): Filters {
  return {
    tipo: searchParams.get("tipo") || "",
    cidade: searchParams.get("cidade") || "",
    operacao: searchParams.get("operacao") || "todos",
    bairro: searchParams.get("bairro") || "",
  };
}

export function validateFilters(filters: Filters): { isValid: boolean; cityId?: number } {
  if (!filters.cidade) {
    return { isValid: false };
  }
  
  const cityId = Number(filters.cidade);
  if (!cityId) {
    return { isValid: false };
  }
  
  return { isValid: true, cityId };
}

export function getTransactionType(operacao: string): "sale" | "rent" | "all" {
  if (operacao === "alugar") return "rent";
  if (operacao === "comprar") return "sale";
  if (operacao === "lancamento") return "sale";
  return "all";
} 