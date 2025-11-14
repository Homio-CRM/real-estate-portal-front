"use client";

import { useState, useEffect } from "react";
import { PropertyFiltersProps } from "../types/components";
import AutocompleteField from "./AutocompleteField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useTransactionType } from "../lib/useTransactionType";
import { propertyCache } from "../lib/propertyCache";

export default function HeroSearchBar({ filters, onFilterChange, onSearch }: PropertyFiltersProps) {
  const [isLocationValid, setIsLocationValid] = useState(false);

  const getTransactionType = (operacao: string): "sale" | "rent" => {
    if (operacao === "alugar") return "rent";
    return "sale";
  };

  const handleTransactionChange = async (operacao: string) => {
    onFilterChange("operacao", operacao);
    
    if (operacao === "lancamento") {
      onFilterChange("tipo", "");
    }

    propertyCache.clear();
    const transactionType = getTransactionType(operacao);

    if (isLocationValid && filters.localizacao) {
      try {
        let lat, lng;

        if (filters.localizacao.includes(',')) {
          const coords = filters.localizacao.split(',');
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        } else {
          lat = -20.2976;
          lng = -40.2958;
        }

        if (!isNaN(lat) && !isNaN(lng)) {
          await propertyCache.preloadProperties({ lat, lng }, transactionType);
        }
      } catch {
        // Silently fail
      }
    }
  };

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
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-wrap gap-1 mb-4">
          <button
            type="button"
            onClick={() => handleTransactionChange("comprar")}
            className={`px-3 sm:px-4 md:px-6 py-2 rounded-t-lg font-medium transition-colors text-xs sm:text-sm md:text-base flex-1 sm:flex-none ${filters.operacao === "comprar"
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Comprar
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange("alugar")}
            className={`px-3 sm:px-4 md:px-6 py-2 rounded-t-lg font-medium transition-colors text-xs sm:text-sm md:text-base flex-1 sm:flex-none ${filters.operacao === "alugar"
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Alugar
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange("lancamento")}
            className={`px-3 sm:px-4 md:px-6 py-2 rounded-t-lg font-medium transition-colors text-xs sm:text-sm md:text-base flex-1 sm:flex-none ${filters.operacao === "lancamento"
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Lançamentos
          </button>

        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
          {filters.operacao !== "lancamento" && (
            <div className="w-full sm:w-48">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Tipo de imóvel
              </label>
              <Select value={Array.isArray(filters.tipo) ? filters.tipo[0] || "todos" : (filters.tipo || "todos")} onValueChange={(value) => onFilterChange("tipo", value === "todos" ? "" : value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Todos os imóveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os imóveis</SelectItem>
                  <SelectItem value="residential_apartment">Apartamento</SelectItem>
                  <SelectItem value="residential_home">Casa</SelectItem>
                  <SelectItem value="residential_condo">Condomínio</SelectItem>
                  <SelectItem value="residential_village_house">Casa de Vila</SelectItem>
                  <SelectItem value="residential_farm_ranch">Fazenda/Sítio/Chácara</SelectItem>
                  <SelectItem value="residential_penthouse">Cobertura</SelectItem>
                  <SelectItem value="residential_agricultural">Sítio/Agrícola</SelectItem>
                  <SelectItem value="residential_flat">Flat</SelectItem>
                  <SelectItem value="residential_kitnet">Kitnet</SelectItem>
                  <SelectItem value="residential_studio">Studio</SelectItem>
                  <SelectItem value="residential_land_lot">Lote/Terreno</SelectItem>
                  <SelectItem value="residential_sobrado">Sobrado</SelectItem>
                  <SelectItem value="commercial_consultorio">Consultório</SelectItem>
                  <SelectItem value="commercial_edificio_residencial">Edifício Residencial</SelectItem>
                  <SelectItem value="commercial_industrial">Industrial</SelectItem>
                  <SelectItem value="commercial_garage">Garagem</SelectItem>
                  <SelectItem value="commercial_hotel">Hotel</SelectItem>
                  <SelectItem value="commercial_building">Prédio/Edifício Comercial</SelectItem>
                  <SelectItem value="commercial_corporate_floor">Andar Corporativo</SelectItem>
                  <SelectItem value="commercial_land_lot">Terreno Comercial</SelectItem>
                  <SelectItem value="commercial_business">Ponto Comercial</SelectItem>
                  <SelectItem value="commercial_studio">Studio Comercial</SelectItem>
                  <SelectItem value="commercial_office">Escritório</SelectItem>
                  <SelectItem value="commercial_edificio_comercial">Edifício Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex-1">
            <AutocompleteField
              value={filters.localizacao}
              onChange={value => onFilterChange("localizacao", value)}
              onValidityChange={setIsLocationValid}
              placeholder="Digite o nome do bairro ou cidade"
              label="Onde deseja morar?"
              type="location"
            />
          </div>

          <div className="flex-shrink-0">
            <Button
              type="submit"
              disabled={!isLocationValid}
              className="w-full bg-primary sm:w-auto px-6 sm:px-8 text-xs sm:text-sm"
            >
              <Search className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Buscar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 