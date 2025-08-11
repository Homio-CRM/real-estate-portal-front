"use client";
import { useState, useEffect, useRef } from "react";
import { Home, Building2 } from "lucide-react";
import type { CityAutocomplete, NeighborhoodAutocomplete } from "../types/components";
import { fetchLocationById, fetchLocationsByQuery, LocationResult } from "../lib/fetchLocations";

type AutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  onItemSelect?: (item: { name: string; type: string; id: number }) => void;
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
  onItemSelect,
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
    
    if (userSelected) {
      return;
    }
    
    if (type === "neighborhood") {
      return;
    }
    
    const fetchItemName = async () => {
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

    // Se já temos dados em cache, filtrar localmente primeiro
    if (hasInitialDataRef.current && cachedDataRef.current) {
      const filteredData = {
        neighborhoods: cachedDataRef.current.neighborhoods.filter((item: NeighborhoodAutocomplete) => 
          item.name.toLowerCase().includes(input.toLowerCase())
        ),
        cities: cachedDataRef.current.cities.filter((item: CityAutocomplete) => 
          item.name.toLowerCase().includes(input.toLowerCase())
        )
      };
      
      setLocationData(filteredData);
      setShowOptions(true);
      
      // Se encontramos resultados no cache, não fazer nova requisição
      if (filteredData.neighborhoods.length > 0 || filteredData.cities.length > 0) {
        return;
      }
    }

    // Só fazer nova requisição se não temos dados ou se o cache não tem resultados
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchLocationsByQuery(input);

        setLocationData(result);
        cachedDataRef.current = result;
        hasInitialDataRef.current = true;
        setShowOptions(true);
      } catch (err) {
        setError("Erro ao buscar localizações");
        setLocationData({ neighborhoods: [], cities: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input, type, cityId]);

  function handleSelect(item: CityAutocomplete | NeighborhoodAutocomplete) {
    setInput(item.name);
    setSelectedItem(item);
    setUserSelected(true);
    setShowOptions(false);
    
    if (type === "neighborhood") {
      onChange(String(item.id));
      
      onItemSelect?.({
        name: item.name,
        type: 'neighborhood',
        id: item.id
      });
    } else if (type === "location") {
      // Verificar se é um bairro (tem propriedade type)
      if ('type' in item && item.type === "neighborhood") {
        // Para bairros, usar o city_id e disparar evento para bairro
        const cityId = 'city_id' in item ? item.city_id : item.id;
        onChange(String(cityId));
        
        // Disparar evento customizado para bairro selecionado
        const event = new CustomEvent('neighborhoodSelected', {
          detail: {
            cityId: cityId,
            neighborhoodName: item.name
          }
        });
        window.dispatchEvent(event);
      } else {
        // Para cidades, usar o id da cidade
        onChange(String(item.id));
      }
      
      onItemSelect?.({
        name: item.name,
        type: 'type' in item ? item.type : 'city',
        id: 'type' in item && item.type === "neighborhood" && 'city_id' in item ? (item.city_id || item.id) : item.id
      });
    } else {
      onChange(String(item.id));
      
      onItemSelect?.({
        name: item.name,
        type: 'city',
        id: item.id
      });
    }
    
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
  const isSelected = selectedItem !== null;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className={`mb-1 text-sm font-medium text-gray-700 ${labelClassName}`}>{label}</label>
      <div className="relative w-full">
        <input
          type="text"
          className={`w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm transition-colors ${
            isSelected 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 focus:border-primary"
          } ${inputClassName}`}
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isSelected) {
              setShowOptions(true);
            }
          }}
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
                <div className="px-3 py-2 text-sm font-semibold text-primary bg-primary/5 border-b border-gray-200 flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
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
                <div className="px-3 py-2 text-sm font-semibold text-primary bg-primary/5 border-b border-gray-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
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
          <div className="absolute right-3 top-3 w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
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