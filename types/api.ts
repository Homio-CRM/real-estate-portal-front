export type FetchListingsParams = {
  cityId: number;
  transactionType: "sale" | "rent";
  tipo?: "Casa" | "Apartamento";
  bairro?: string;
  limit?: number;
  offset?: number;
};

export type EntityLocationResponse = {
  entity_id: string;
  entity_type: "listing" | "condominium";
};

export type ListingLocationResponse = EntityLocationResponse & {
  entity_type: "listing";
  entity_id: string;
};

export type CondominiumLocationResponse = EntityLocationResponse & {
  entity_type: "condominium";
  entity_id: string;
};

export type ListingResponse = {
  listing_id: string;
  agency_id: string;
  title: string;
  transaction_type: string;
  virtual_tour?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
};

export type CondominiumResponse = {
  id: string;
  name: string;
  agency_id: string;
};

export type ListingDetailsResponse = {
  listing_id: string;
  iptu_amount?: number;
  iptu_currency?: string;
  iptu_period?: string;
  list_price_amount?: number;
  list_price_currency?: string;
  rental_period?: string;
  property_administration_fee_amount?: number;
  property_administration_fee_currency?: string;
  description?: string;
  property_type: string;
  area?: number;
  bathroom_count?: number;
  bedroom_count?: number;
  garage_count?: number;
  floors_count?: number;
  unit_floor?: number;
  buildings_count?: number;
  suite_count?: number;
  usage_type?: string;
  year_built?: number;
};

export type CondominiumDetailsResponse = {
  condominium_id: string;
  is_launch?: boolean;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  year_built?: number;
  total_units?: number;
  description?: string;
  usage_type?: string;
};

export type CityResponse = {
  id: number;
  name: string;
  state_id: number;
}; 