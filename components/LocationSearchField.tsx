"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildLaunchesUrl, buildListingsUrl } from "../lib/navigation";
import AutocompleteField from "./AutocompleteField";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

type LocationSearchFieldProps = {
  currentLocation: string;
  currentFilters: {
    operacao: string;
    tipo: string;
    bairro: string;
  };
  showCurrentLocation?: boolean;
  className?: string;
  onOpenFilters?: () => void;
};

export default function LocationSearchField({ 
  currentLocation, 
  currentFilters, 
  showCurrentLocation = true,
  className = "",
  onOpenFilters
}: LocationSearchFieldProps) {
  const [newLocation, setNewLocation] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<"city" | "neighborhood" | null>(null);
  const [selectedItemData, setSelectedItemData] = useState<{ id: number; name: string } | null>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleLocationChange = (value: string) => {
    setNewLocation(value);
    // Resetar os estados quando o usuário digitar
    if (selectedItemType || selectedItemData) {
      setSelectedItemType(null);
      setSelectedItemData(null);
    }
  };

  const handleItemSelect = (item: { name: string; type: string; id: number }) => {
    setSelectedItemType(item.type as "city" | "neighborhood");
    
    if (item.type === "city") {
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(String(item.id)); // ID da cidade
    } else if (item.type === "neighborhood") {
      // Para bairros, o item.id já é o city_id do bairro
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(item.name); // Nome do bairro para exibição
    }
  };

  const handleSearch = () => {
    if (!isLocationValid || !selectedItemType || !selectedItemData) {
      return;
    }
    
    setIsSearching(true);
    
    // Determinar se é cidade ou bairro baseado no tipo selecionado
    const filters = {
      ...currentFilters,
      // Se for cidade, usar como localizacao e limpar bairro
      // Se for bairro, atualizar localizacao com city_id e bairro com nome do bairro
      ...(selectedItemType === "city" ? {
        localizacao: String(selectedItemData.id), // ID da cidade
        bairro: ""
      } : {
        // Para bairro, precisamos do city_id do bairro selecionado
        // O selectedItemData.id neste caso é o city_id do bairro
        localizacao: String(selectedItemData.id), // ID da cidade do bairro
        bairro: selectedItemData.name // Nome do bairro
      })
    };
    
    const urlBuilder = (filters.operacao === "lancamento")
      ? buildLaunchesUrl
      : buildListingsUrl;

    const url = urlBuilder(filters as Record<string, string | string[]>);
    
    // Navegar diretamente para a URL - sem evento
    router.push(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-semibold text-gray-900">Buscar em outra localização</h4>
            {showCurrentLocation && (
              <span className="text-sm text-gray-600">
                Buscando atualmente em: <span className="font-medium">{currentLocation}</span>
              </span>
            )}
          </div>
          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 lg:hidden"
            >
              Filtros
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 min-w-[220px]">
            <AutocompleteField
              value={newLocation}
              onChange={handleLocationChange}
              onValidityChange={setIsLocationValid}
              onItemSelect={handleItemSelect}
              placeholder="Digite o nome do bairro ou cidade"
              label=""
              type="location"
              className="mb-0"
              labelClassName="sr-only"
              inputClassName="h-11 text-base"
            />
          </div>
          <div className="sm:flex-shrink-0">
            <Button
              onClick={handleSearch}
              disabled={!isLocationValid || isSearching}
              className="h-11 w-full sm:w-auto px-6"
            >
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 