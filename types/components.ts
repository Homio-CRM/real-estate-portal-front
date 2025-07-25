import { PropertyCard } from "./listings";
import { Filters } from "../lib/filters";

export type PropertyFiltersProps = {
  filters: Filters;
  onFilterChange: (key: string, value: string) => void;
  onSearch: () => void;
};

export type PropertyCarouselProps = {
  properties: PropertyCard[];
};

export type CityAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
};

export type CityAutocomplete = {
  id: number;
  name: string;
}; 