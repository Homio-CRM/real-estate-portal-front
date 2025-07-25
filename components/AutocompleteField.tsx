"use client";
import { useState, useEffect, useRef } from "react";
import type { CityAutocomplete, NeighborhoodAutocomplete } from "../types/components";
import { fetchLocationById, fetchLocationsByQuery, LocationResult } from "../lib/fetchLocations";

type AutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  placeholder: string;
  label: string;
  type: "city" | "neighborhood" | "location";
  cityId?: string;
};

export default function AutocompleteField({ 
  value, 
  onChange, 
  onValidityChange, 
  placeholder, 
  label, 
  type, 
  cityId 
}: AutocompleteFieldProps) {
  const [input, setInput] = useState("");
  const [locationData, setLocationData] = useState<LocationResult>({ neighborhoods: [], cities: [] });
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<(CityAutocomplete | NeighborhoodAutocomplete) | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value) {
      setInput("");
      setSelectedItem(null);
      onValidityChange?.(false);
      return;
    }
    const fetchItemName = async () => {
      const item = await fetchLocationById(value, type);
      if (item) {
        setInput(item.name);
        setSelectedItem(item);
        onValidityChange?.(true);
      }
    };
    fetchItemName();
  }, [value, onValidityChange, type]);

  useEffect(() => {
    if (!input) {
      setLocationData({ neighborhoods: [], cities: [] });
      setError(null);
      setShowOptions(false);
      setSelectedItem(null);
      onValidityChange?.(false);
      return;
    }

    if (type === "neighborhood" && !cityId) {
      setLocationData({ neighborhoods: [], cities: [] });
      setError(null);
      setShowOptions(false);
      setSelectedItem(null);
      onValidityChange?.(false);
      return;
    }

    // Para o tipo "location", não precisamos da validação de cityId
    if (type === "location") {
      // Continua normalmente
    }

    setLoading(true);
    setError(null);
    setSelectedItem(null);
    onValidityChange?.(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchLocationsByQuery(input);
        setLocationData(data);
        setError(null);
        onValidityChange?.(data.cities.length > 0 || data.neighborhoods.length > 0);
      } catch (error: unknown) {
        setLocationData({ neighborhoods: [], cities: [] });
        setError(error instanceof Error ? error.message : "Erro ao buscar opções");
        onValidityChange?.(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [input, onValidityChange, type, cityId]);

  function handleSelect(item: CityAutocomplete | NeighborhoodAutocomplete) {
    setInput(item.name);
    setSelectedItem(item);
    
    if ('type' in item && item.type === 'neighborhood') {
      // Para bairros, usar o city_id e disparar evento para atualizar o campo bairro
      const neighborhoodItem = item as NeighborhoodAutocomplete;
      if (neighborhoodItem.city_id) {
        onChange(String(neighborhoodItem.city_id));
        // Disparar evento para atualizar o campo bairro
        const event = new CustomEvent('neighborhoodSelected', {
          detail: {
            cityId: neighborhoodItem.city_id,
            neighborhoodName: item.name
          }
        });
        window.dispatchEvent(event);
      }
    } else {
      // Para cidades, usar o ID normalmente
      onChange(String(item.id));
    }
    
    setShowOptions(false);
    onValidityChange?.(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setSelectedItem(null);
    onChange("");
    setShowOptions(true);
  }

  const hasOptions = locationData.cities.length > 0 || locationData.neighborhoods.length > 0;

  return (
    <div className="flex flex-col w-full">
      <label className="mb-1 text-sm text-muted-foreground">{label}</label>
      <div className="relative w-full">
        <input
          type="text"
          className="border border-border rounded px-3 py-2 bg-background text-foreground w-full"
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowOptions(true)}
          autoComplete="off"
          required
        />
        {showOptions && hasOptions && (
          <div className="absolute z-10 w-full bg-background border border-border rounded mt-1 max-h-60 overflow-auto shadow">
            {locationData.neighborhoods.length > 0 && (
              <div>
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                  Bairros
                </div>
                <ul>
                  {locationData.neighborhoods.map((item) => (
                    <li
                      key={item.id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted"
                      onMouseDown={() => handleSelect(item)}
                    >
                      {item.name}, {item.city_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {locationData.cities.length > 0 && (
              <div>
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                  Cidades
                </div>
                <ul>
                  {locationData.cities.map((item) => (
                    <li
                      key={item.id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted"
                      onMouseDown={() => handleSelect(item)}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute right-3 top-3 w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
        )}
        {error && showOptions && (
          <div className="absolute z-10 w-full bg-background border border-red-500 rounded mt-1 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 