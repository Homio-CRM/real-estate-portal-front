"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildResultsUrl } from "../lib/navigation";
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
  onLocationChange?: (location: string) => void;
  showCurrentLocation?: boolean;
  className?: string;
};

export default function LocationSearchField({ 
  currentLocation, 
  currentFilters, 
  onLocationChange,
  showCurrentLocation = true,
  className = ""
}: LocationSearchFieldProps) {
  const [newLocation, setNewLocation] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<"city" | "neighborhood" | null>(null);
  const [isLocationValid, setIsLocationValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleNeighborhoodSelected = (event: CustomEvent) => {
      const { neighborhoodName } = event.detail;
      setNewLocation(neighborhoodName);
      onLocationChange?.(neighborhoodName);
    };

    window.addEventListener('neighborhoodSelected', handleNeighborhoodSelected as EventListener);
    
    return () => {
      window.removeEventListener('neighborhoodSelected', handleNeighborhoodSelected as EventListener);
    };
  }, [onLocationChange]);

  const handleLocationChange = (value: string) => {
    setNewLocation(value);
    onLocationChange?.(value);
  };

  const handleItemSelect = (item: { name: string; type: string; id: number }) => {
    setSelectedItemType(item.type as "city" | "neighborhood");
  };

  const handleSearch = () => {
    if (!isLocationValid) return;
    
    setIsSearching(true);
    
    const filters = {
      ...currentFilters,
      localizacao: newLocation,
      ...(selectedItemType === "city" ? {} : { bairro: newLocation }),
    };
    
    const url = buildResultsUrl(filters as Record<string, string>);
    router.push(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Buscar em outra localização
          </h4>
          <div className="flex gap-3">
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
            
            <div className="flex-shrink-0">
              <Button
                onClick={handleSearch}
                disabled={!isLocationValid || isSearching}
                className="px-6"
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