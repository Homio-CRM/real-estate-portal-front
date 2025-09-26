"use client";

import { useState, useEffect } from "react";
import { PropertyFiltersProps } from "../types/components";
import AutocompleteField from "./AutocompleteField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { propertyCache } from "../lib/propertyCache";

export default function HeroSearchBar({ filters, onFilterChange, onSearch }: PropertyFiltersProps) {
  const [isLocationValid, setIsLocationValid] = useState(false);
  
  // Converter operação para tipo de transação
  const getTransactionType = (operacao: string): "sale" | "rent" | "all" => {
    if (operacao === "alugar") return "rent";
    if (operacao === "comprar") return "sale";
    if (operacao === "lancamento") return "sale";
    return "sale"; // Padrão para compra
  };
  
  const handleTransactionChange = async (operacao: string) => {
    onFilterChange("operacao", operacao);
    
    // Fazer requisição imediata para o novo tipo de transação
    const transactionType = getTransactionType(operacao);
    
    // Limpar cache anterior e fazer nova requisição
    propertyCache.clear();
    
    // Se temos localização válida, fazer nova busca
    if (isLocationValid && filters.cidade) {
      try {
        // Extrair coordenadas da localização (formato pode variar)
        let lat, lng;
        
        if (filters.cidade.includes(',')) {
          // Formato: "lat,lng"
          const coords = filters.cidade.split(',');
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1]);
        } else {
          // Formato: cityId (número)
          // Usar localização padrão de Vitória
          lat = -20.2976;
          lng = -40.2958;
        }
        
        if (!isNaN(lat) && !isNaN(lng)) {
          await propertyCache.preloadProperties(
            { lat, lng },
            transactionType
          );
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      }
    }
  };

  useEffect(() => {
    const handleNeighborhoodSelected = (event: CustomEvent) => {
      const { cityId, neighborhoodName } = event.detail;
      // Remover a parte da cidade do nome do bairro
      const cleanNeighborhoodName = neighborhoodName.split(' - ')[0];
      onFilterChange("cidade", String(cityId));
      onFilterChange("bairro", cleanNeighborhoodName);
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
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6">
        <div className="mb-4 grid grid-cols-3 gap-1 md:flex md:justify-start md:gap-1">
          <button
            type="button"
            onClick={() => handleTransactionChange("comprar")}
            className={`h-9 w-full md:h-10 md:w-auto px-2 md:px-4 rounded-t-md font-medium transition-colors text-xs md:text-sm text-center ${
              filters.operacao === "comprar"
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Comprar
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange("alugar")}
            className={`h-9 w-full md:h-10 md:w-auto px-2 md:px-4 rounded-t-md font-medium transition-colors text-xs md:text-sm text-center ${
              filters.operacao === "alugar"
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Alugar
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange("lancamento")}
            className={`h-9 w-full md:h-10 md:w-auto px-2 md:px-4 rounded-t-md font-medium transition-colors text-xs md:text-sm text-center ${
              filters.operacao === "lancamento"
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Lançamento
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[240px,1fr,auto] items-end gap-3 md:gap-4">
          <div className="w-full">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Tipo de imóvel</label>
            <Select value={filters.tipo || "todos"} onValueChange={(value) => onFilterChange("tipo", value === "todos" ? "" : value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Todos os imóveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os imóveis</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Condomínio">Condomínio</SelectItem>
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

          <div className="w-full">
            <AutocompleteField
              value={filters.cidade}
              onChange={value => onFilterChange("cidade", value)}
              onValidityChange={setIsLocationValid}
              placeholder="Digite o nome do bairro ou cidade"
              label="Onde deseja morar?"
              type="location"
              inputClassName="h-11"
            />
          </div>

          <div className="w-full md:w-auto">
            <Button
              type="submit"
              disabled={!isLocationValid}
              className="w-full md:w-auto h-11 px-6"
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