"use client";

import { useState, useEffect } from "react";
import { PropertyFiltersProps } from "../types/components";
import AutocompleteField from "./AutocompleteField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

export default function HeroSearchBar({ filters, onFilterChange, onSearch }: PropertyFiltersProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocationValid) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-1 mb-4">
          <button
            type="button"
            onClick={() => onFilterChange("operacao", "comprar")}
            className={`px-4 md:px-6 py-2 rounded-t-lg font-medium transition-colors text-sm md:text-base ${
              filters.operacao === "comprar"
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Comprar
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("operacao", "alugar")}
            className={`px-4 md:px-6 py-2 rounded-t-lg font-medium transition-colors text-sm md:text-base ${
              filters.operacao === "alugar"
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Alugar
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de imóvel
            </label>
            <Select value={filters.tipo || "todos"} onValueChange={(value) => onFilterChange("tipo", value === "todos" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os imóveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os imóveis</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Casa de Condominio">Casa de Condominio</SelectItem>
                <SelectItem value="Cobertura">Cobertura</SelectItem>
                <SelectItem value="Flat">Flat</SelectItem>
                <SelectItem value="Kitnet/Conjugado">Kitnet/Conjugado</SelectItem>
                <SelectItem value="Lote/Terreno">Lote/Terreno</SelectItem>
                <SelectItem value="Sobrado">Sobrado</SelectItem>
                <SelectItem value="Edificio Residencial">Edificio Residencial</SelectItem>
                <SelectItem value="Fazenda/Sítios/Chácaras">Fazenda/Sítios/Chácaras</SelectItem>
                <SelectItem value="Consultório">Consultório</SelectItem>
                <SelectItem value="Galpão/Depósito/Armazém">Galpão/Depósito/Armazém</SelectItem>
                <SelectItem value="Imóvel Comercial">Imóvel Comercial</SelectItem>
                <SelectItem value="Lote/ Terreno">Lote/ Terreno</SelectItem>
                <SelectItem value="Ponto">Ponto</SelectItem>
                <SelectItem value="Comercial/Loja/Box">Comercial/Loja/Box</SelectItem>
                <SelectItem value="sala/conjunto">sala/conjunto</SelectItem>
                <SelectItem value="Prédio/Edifício Inteiro">Prédio/Edifício Inteiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <AutocompleteField
              value={filters.localizacao}
              onChange={value => onFilterChange("localizacao", value)}
              onValidityChange={setIsLocationValid}
              placeholder="Digite o nome da rua, bairro ou cidade"
              label="Onde deseja morar?"
              type="location"
            />
          </div>
          
          <div className="flex-shrink-0">
            <Button
              type="submit"
              disabled={!isLocationValid}
              className="w-full md:w-auto px-8"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 