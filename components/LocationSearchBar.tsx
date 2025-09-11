"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildListingsUrl } from "../lib/navigation";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

type LocationSearchBarProps = {
  currentLocation: string;
  currentFilters: {
    operacao: string;
    tipo: string;
    bairro: string;
  };
};

export default function LocationSearchBar({ currentLocation, currentFilters }: LocationSearchBarProps) {
  const [newLocation, setNewLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLocation(e.target.value);
  };

  const handleSearch = () => {
    if (!newLocation.trim()) return;
    
    setIsSearching(true);
    const filters = {
      ...currentFilters,
      localizacao: newLocation,
      bairro: newLocation,
    };
    
    const url = buildListingsUrl(filters as Record<string, string>);
    router.push(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar em outra localização
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                placeholder="Digite o nome do bairro ou cidade"
                value={newLocation}
                onChange={handleLocationChange}
                onKeyPress={handleKeyPress}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex-shrink-0">
              <Button
                onClick={handleSearch}
                disabled={!newLocation.trim() || isSearching}
                className="px-6"
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        Buscando atualmente em: <span className="font-medium">{currentLocation}</span>
      </div>
    </div>
  );
} 