export type Listing = {
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

export type Condominium = {
  id: string;
  name: string;
  agency_id: string;
};

export type CondominiumDetails = {
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

export type ListingDetails = {
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

export type EntityLocation = {
  entity_type: "listing" | "condominium";
  listing_id?: string;
  condominium_id?: string;
  display_address: string;
  country_code: string;
  state_id: number;
  city_id: number;
  zone?: string;
  neighborhood?: string;
  address?: string;
  street_number?: string;
  complement?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
};

export type ListingLocation = EntityLocation & {
  entity_type: "listing";
  listing_id: string;
};

export type CondominiumLocation = EntityLocation & {
  entity_type: "condominium";
  condominium_id: string;
};

export type MediaItem = {
  id: string;
  entity_type: "listing" | "condominium";
  listing_id?: string;
  condominium_id?: string;
  medium: string;
  caption?: string;
  is_primary: boolean;
  url: string;
};

export type City = {
  id: number;
  state_id: number;
  name: string;
};

export type State = {
  id: number;
  name: string;
  abbreviation: string;
};

export type EntityFeatures = {
  entity_type: "listing" | "condominium";
  listing_id?: string;
  condominium_id?: string;
  pool?: boolean;
  gym?: boolean;
  party_room?: boolean;
  barbecue_area?: boolean;
  multipurpose_court?: boolean;
  tennis_court?: boolean;
  sauna?: boolean;
  gourmet_area?: boolean;
  playground?: boolean;
  game_room?: boolean;
  pet_area?: boolean;
  garden?: boolean;
  zen_space?: boolean;
  visitor_parking?: boolean;
  covered_parking?: boolean;
  elevator?: boolean;
  electric_fence?: boolean;
  security_24h?: boolean;
  security_guardhouse?: boolean;
  security_cameras?: boolean;
  alarm_system?: boolean;
  cinema_room?: boolean;
  coworking?: boolean;
  library?: boolean;
  restaurant?: boolean;
  helipad?: boolean;
  marina?: boolean;
  hammock_area?: boolean;
  orchid_garden?: boolean;
};

export type ListingFeatures = EntityFeatures & {
  entity_type: "listing";
  listing_id: string;
};

export type CondominiumFeatures = EntityFeatures & {
  entity_type: "condominium";
  condominium_id: string;
};

export type PropertyCard = Listing & ListingDetails & ListingLocation & ListingFeatures & {
  image?: string;
  forRent?: boolean;
  price?: string;
  iptu?: string;
  media?: MediaItem[];
};

export type CondominiumCard = Condominium & CondominiumDetails & CondominiumLocation & CondominiumFeatures & {
  image?: string;
  price?: string;
  media?: MediaItem[];
}; 