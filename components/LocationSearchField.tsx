"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildListingsUrl } from "../lib/navigation";
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
};

export default function LocationSearchField({ 
  currentLocation, 
  currentFilters, 
  showCurrentLocation = true,
  className = ""
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

  const handleItemSelect = (item: { name: string; type: string; id: number; city_id?: number }) => {
    console.log('🏠 LocationSearchField: Item selecionado:', item);
    
    setSelectedItemType(item.type as "city" | "neighborhood");
    
    if (item.type === "city") {
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(String(item.id)); // ID da cidade
    } else if (item.type === "neighborhood") {
      // Agora o item.id JÁ É o city_id correto
      console.log('🏘️ LocationSearchField: Bairro selecionado - cityId:', item.id, 'name:', item.name);
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(item.name); // Nome do bairro para exibição
    }
  };

  const handleSearch = () => {
    console.log('🔍 LocationSearchField: Iniciando busca com:', {
      isLocationValid,
      selectedItemType,
      selectedItemData,
      currentFilters
    });
    
    if (!isLocationValid || !selectedItemType || !selectedItemData) {
      return;
    }
    
    setIsSearching(true);
    
    // Determinar se é cidade ou bairro baseado no tipo selecionado
    const filters = {
      ...currentFilters,
      // Se for cidade, usar como cidade e limpar bairro
      // Se for bairro, atualizar cidade com city_id e bairro com nome do bairro
      ...(selectedItemType === "city" ? {
        cidade: String(selectedItemData.id), // ID da cidade
        bairro: ""
      } : {
        // Para bairro, precisamos do city_id do bairro selecionado
        // O selectedItemData.id neste caso é o city_id do bairro
        cidade: String(selectedItemData.id), // ID da cidade do bairro
        bairro: selectedItemData.name // Nome do bairro
      })
    };
    
    console.log('🏠 LocationSearchField: Filtros finais:', filters);
    const url = buildListingsUrl(filters as Record<string, string>);
    console.log('🌐 LocationSearchField: URL gerada:', url);
    
    // Navegar diretamente para a URL - sem evento
    router.push(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Buscar em outra localização
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
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
              />
            </div>
            
            <div className="flex-shrink-0 sm:w-auto">
              <Button
                onClick={handleSearch}
                disabled={!isLocationValid || isSearching}
                className="w-full sm:w-auto px-6"
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showCurrentLocation && (
        <div className="mt-2 text-sm text-gray-600">
          Buscando atualmente em: <span className="font-medium">{currentLocation}</span>
        </div>
      )}
    </div>
  );
} 