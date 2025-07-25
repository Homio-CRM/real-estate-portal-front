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

export type CityAutocomplete = {
  id: number;
  name: string;
};

export type NeighborhoodAutocomplete = {
  id: number;
  name: string;
  type: string;
  city_name: string;
  city_id?: number;
}; 