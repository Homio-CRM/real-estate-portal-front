"use client";

import { useState, useEffect } from "react";
import { PropertyFiltersProps } from "../types/components";
import AutocompleteField from "./AutocompleteField";

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
                ? "bg-blue-600 text-white"
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
                ? "bg-blue-600 text-white"
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
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.tipo}
              onChange={e => onFilterChange("tipo", e.target.value)}
            >
              <option value="">Todos os imóveis</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa de Condominio">Casa de Condominio</option>
              <option value="Cobertura">Cobertura</option>
              <option value="Flat">Flat</option>
              <option value="Kitnet/Conjugado">Kitnet/Conjugado</option>
              <option value="Lote/Terreno">Lote/Terreno</option>
              <option value="Sobrado">Sobrado</option>
              <option value="Edificio Residencial">Edificio Residencial</option>
              <option value="Fazenda/Sítios/Chácaras">Fazenda/Sítios/Chácaras</option>
              <option value="Consultório">Consultório</option>
              <option value="Galpão/Depósito/Armazém">Galpão/Depósito/Armazém</option>
              <option value="Imóvel Comercial">Imóvel Comercial</option>
              <option value="Lote/ Terreno">Lote/ Terreno</option>
              <option value="Ponto">Ponto</option>
              <option value="Comercial/Loja/Box">Comercial/Loja/Box</option>
              <option value="sala/conjunto">sala/conjunto</option>
              <option value="Prédio/Edifício Inteiro">Prédio/Edifício Inteiro</option>
            </select>
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
            <button
              type="submit"
              disabled={!isLocationValid}
              className={`w-full md:w-auto px-8 py-2 rounded-lg font-semibold text-white transition-colors ${
                isLocationValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 