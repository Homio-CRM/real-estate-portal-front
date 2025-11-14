"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const handleLocationChange = (value: string) => {
    setNewLocation(value);
    if (selectedItemType || selectedItemData) {
      setSelectedItemType(null);
      setSelectedItemData(null);
    }
  };

  const handleItemSelect = (item: { name: string; type: string; id: number }) => {
    setSelectedItemType(item.type as "city" | "neighborhood");
    
    if (item.type === "city") {
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(String(item.id));
    } else if (item.type === "neighborhood") {
      setSelectedItemData({ id: item.id, name: item.name });
      setNewLocation(item.name);
    }
  };

  const handleSearch = () => {
    if (!isLocationValid || !selectedItemType || !selectedItemData) {
      return;
    }
    
    setIsSearching(true);
    
    const allFilters: Record<string, string | string[]> = {};
    
    searchParams.forEach((value, key) => {
      if (key === "localizacao" || key === "bairro") {
        return;
      }
      
      if (key === "tipo") {
        if (value.includes(",")) {
          allFilters[key] = value.split(",").filter(t => t.trim() !== "");
        } else {
          allFilters[key] = value;
        }
      } else {
        allFilters[key] = value;
      }
    });
    
    if (selectedItemType === "city") {
      allFilters.localizacao = String(selectedItemData.id);
      allFilters.bairro = "";
    } else {
      allFilters.localizacao = String(selectedItemData.id);
      allFilters.bairro = selectedItemData.name;
    }
    
    if (!allFilters.operacao) {
      allFilters.operacao = currentFilters.operacao || "todos";
    }
    
    if (!allFilters.tipo) {
      if (currentFilters.tipo) {
        allFilters.tipo = currentFilters.tipo;
      }
    }
    
    const urlBuilder = (allFilters.operacao === "lancamento")
      ? buildLaunchesUrl
      : buildListingsUrl;

    const url = urlBuilder(allFilters);
    
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