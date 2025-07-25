"use client";
import { useState, useEffect, useRef } from "react";
import { CityAutocompleteProps } from "../types/components";
import type { CityAutocomplete } from "../types/components";
import { fetchCityById, fetchCitiesByQuery } from "../lib/fetchCities";

export default function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<CityAutocomplete[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value) {
      setInput("");
      return;
    }
    const fetchCityName = async () => {
      const city = await fetchCityById(value);
      setInput(city?.name || "");
    };
    fetchCityName();
  }, [value]);

  useEffect(() => {
    if (!input) {
      setOptions([]);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const cities = await fetchCitiesByQuery(input);
      setOptions(cities);
      setLoading(false);
    }, 300);
  }, [input]);

  function handleSelect(city: CityAutocomplete) {
    setInput(city.name);
    onChange(String(city.id));
    setShowOptions(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    onChange("");
    setShowOptions(true);
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="border border-border rounded px-3 py-2 bg-background text-foreground w-full"
        placeholder="Digite o nome da cidade"
        value={input}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        autoComplete="off"
        required
      />
      {showOptions && options.length > 0 && (
        <ul className="absolute z-10 w-full bg-background border border-border rounded mt-1 max-h-60 overflow-auto shadow">
          {options.map((city) => (
            <li
              key={city.id}
              className="px-3 py-2 cursor-pointer hover:bg-muted"
              onMouseDown={() => handleSelect(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-3 top-3 w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
      )}
    </div>
  );
} 