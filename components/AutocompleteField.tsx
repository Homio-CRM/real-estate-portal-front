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
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export default function AutocompleteField({ 
  value, 
  onChange, 
  onValidityChange, 
  placeholder, 
  label, 
  type, 
  cityId,
  className = "",
  inputClassName = "",
  labelClassName = ""
}: AutocompleteFieldProps) {
  const [input, setInput] = useState("");
  const [locationData, setLocationData] = useState<LocationResult>({ neighborhoods: [], cities: [] });
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<(CityAutocomplete | NeighborhoodAutocomplete) | null>(null);
  const [userSelected, setUserSelected] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const cachedDataRef = useRef<LocationResult>({ neighborhoods: [], cities: [] });
  const hasInitialDataRef = useRef(false);

  useEffect(() => {
    if (!value) {
      setInput("");
      setSelectedItem(null);
      setUserSelected(false);
      onValidityChange?.(false);
      return;
    }
    
    // Se o usuário já selecionou algo, não sobrescrever
    if (userSelected) {
      return;
    }
    
    // Se o tipo é neighborhood, não tentar buscar por ID pois estamos usando city_id
    if (type === "neighborhood") {
      return;
    }
    
    const fetchItemName = async () => {
      // Para busca por ID, sempre usar type "city" pois a API só suporta isso
      const item = await fetchLocationById(value, "city");
      if (item) {
        setInput(item.name);
        setSelectedItem(item);
        onValidityChange?.(true);
      }
    };
    fetchItemName();
  }, [value, onValidityChange, type, userSelected]);

    useEffect(() => {
    if (!input) {
      setLocationData({ neighborhoods: [], cities: [] });
      setError(null);
      setShowOptions(false);
      setSelectedItem(null);
      onValidityChange?.(false);
      cachedDataRef.current = { neighborhoods: [], cities: [] };
      hasInitialDataRef.current = false;
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

    // Se já temos dados iniciais, filtrar do cache
    if (hasInitialDataRef.current && input.length > 1) {
      const filteredData = {
        neighborhoods: cachedDataRef.current.neighborhoods.filter((item: NeighborhoodAutocomplete) => 
          item.name.toLowerCase().includes(input.toLowerCase())
        ),
        cities: cachedDataRef.current.cities.filter((item: CityAutocomplete) => 
          item.name.toLowerCase().includes(input.toLowerCase())
        )
      };
      setLocationData(filteredData);
      setError(null);
      return;
    }

    // Se é a primeira letra ou não temos dados iniciais, fazer requisição
    if (input.length === 1 || !hasInitialDataRef.current) {
      setLoading(true);
      setError(null);
      setSelectedItem(null);
      onValidityChange?.(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await fetchLocationsByQuery(input);
          setLocationData(data);
          cachedDataRef.current = data;
          hasInitialDataRef.current = true;
          setError(null);
        } catch (error: unknown) {
          setLocationData({ neighborhoods: [], cities: [] });
          setError(error instanceof Error ? error.message : "Erro ao buscar opções");
          onValidityChange?.(false);
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  }, [input, onValidityChange, type, cityId]);

  function handleSelect(item: CityAutocomplete | NeighborhoodAutocomplete) {
    setInput(item.name);
    setSelectedItem(item);
    setUserSelected(true);
    
    if ('type' in item && item.type === 'neighborhood') {
      // Para bairros, usar o city_id como identificador
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
    setUserSelected(false);
    onChange("");
    setShowOptions(true);
    onValidityChange?.(false);
  }

  const hasOptions = locationData.cities.length > 0 || locationData.neighborhoods.length > 0;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className={`mb-1 text-sm font-medium text-gray-700 ${labelClassName}`}>{label}</label>
      <div className="relative w-full">
        <input
          type="text"
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowOptions(true)}
          onBlur={() => {
            setTimeout(() => {
              setShowOptions(false);
              if (!selectedItem) {
                onValidityChange?.(false);
              }
            }, 200);
          }}
          autoComplete="off"
          required
        />
        {showOptions && hasOptions && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
            {locationData.neighborhoods.length > 0 && (
              <div>
                <div className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                  Bairros
                </div>
                <ul>
                  {locationData.neighborhoods.map((item) => (
                    <li
                      key={item.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
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
                <div className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                  Cidades
                </div>
                <ul>
                  {locationData.cities.map((item) => (
                    <li
                      key={item.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
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
          <div className="absolute right-3 top-3 w-4 h-4 animate-spin border-2 border-blue-600 border-t-transparent rounded-full"></div>
        )}
        {error && showOptions && (
          <div className="absolute z-10 w-full bg-white border border-red-500 rounded-lg mt-1 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 