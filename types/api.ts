export type FetchListingsParams = {
  cityId: number;
  transactionType: "sale" | "rent";
  tipo?: "Casa" | "Apartamento";
  bairro?: string;
  limit?: number;
  offset?: number;
};

export type ListingLocationResponse = {
  listing_id: string;
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

export type ListingDetailsResponse = {
  listing_id: string;
  iptu_amount?: number;
  iptu_currency?: string;
  iptu_period?: string;
  list_price_amount?: number;
  list_price_currency?: string;
  rental_price_amount?: number;
  rental_price_currency?: string;
  rental_price_period?: string;
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