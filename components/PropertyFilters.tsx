"use client";

import { useState, useEffect } from "react";
import AutocompleteField from "./AutocompleteField";
import { PropertyFiltersProps } from "../types/components";

export default function PropertyFilters({ filters, onFilterChange, onSearch }: PropertyFiltersProps) {
  const [isLocationValid, setIsLocationValid] = useState(false);

  useEffect(() => {
    const handleNeighborhoodSelected = (event: CustomEvent) => {
      const { cityId, neighborhoodName } = event.detail;
      onFilterChange("localizacao", String(cityId));
      onFilterChange("bairro", neighborhoodName);
    };

    window.addEventListener('neighborhoodSelected', handleNeighborhoodSelected as EventListener);
    
    return () => {
      window.removeEventListener('neighborhoodSelected', handleNeighborhoodSelected as EventListener);
    };
  }, [onFilterChange]);
  return (
    <section className="w-full bg-background py-10 px-4 rounded-b-3xl shadow-sm flex justify-center items-center min-h-[60vh]">
      <form className="w-full max-w-md flex flex-col items-center gap-4" onSubmit={e => { e.preventDefault(); onSearch(); }}>
        <AutocompleteField
          value={filters.localizacao}
          onChange={value => onFilterChange("localizacao", value)}
          onValidityChange={setIsLocationValid}
          placeholder="Onde deseja morar?"
          label="Localização"
          type="location"
        />
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
          className={`mt-4 h-12 w-full rounded font-semibold text-base ${
            isLocationValid
              ? "bg-primary text-primary-foreground" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          type="submit"
          disabled={!isLocationValid}
        >
          Buscar
        </button>
      </form>
    </section>
  );
} 