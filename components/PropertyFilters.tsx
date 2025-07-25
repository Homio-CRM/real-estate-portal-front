"use client";

import CityAutocomplete from "./CityAutocomplete";
import { PropertyFiltersProps } from "../types/components";

export default function PropertyFilters({ filters, onFilterChange, onSearch }: PropertyFiltersProps) {
  return (
    <section className="w-full bg-background py-10 px-4 rounded-b-3xl shadow-sm flex justify-center items-center min-h-[60vh]">
      <form className="w-full max-w-md flex flex-col items-center gap-4" onSubmit={e => { e.preventDefault(); onSearch(); }}>
        <div className="flex flex-col w-full">
          <label className="mb-1 text-sm text-muted-foreground">Cidade</label>
          <CityAutocomplete
            value={filters.localizacao}
            onChange={value => onFilterChange("localizacao", value)}
          />
        </div>
        <div className="flex flex-row w-full gap-4">
          <div className="flex flex-col w-1/2">
            <label className="mb-1 text-sm text-muted-foreground">Operação</label>
            <select
              className="border border-border rounded px-3 py-2 bg-background text-foreground"
              value={filters.operacao}
              onChange={e => onFilterChange("operacao", e.target.value)}
            >
              <option value="comprar">Comprar</option>
              <option value="alugar">Alugar</option>
            </select>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="mb-1 text-sm text-muted-foreground">Tipo de imóvel</label>
            <select
              className="border border-border rounded px-3 py-2 bg-background text-foreground"
              value={filters.tipo}
              onChange={e => onFilterChange("tipo", e.target.value)}
            >
              <option value="">Todos os imóveis</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
        </div>
        <button
          className="mt-4 h-12 w-full rounded bg-primary text-primary-foreground font-semibold text-base"
          type="submit"
        >
          Buscar
        </button>
      </form>
    </section>
  );
} 