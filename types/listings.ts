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

export type ListingDetails = {
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

export type ListingLocation = {
  listing_id: string;
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

export type MediaItem = {
  id: string;
  listing_id: string;
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

export type ListingFeatures = {
  listing_id: string;
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

export type PropertyCard = Listing & ListingDetails & ListingLocation & {
  image?: string;
  forRent?: boolean;
  price?: string;
  iptu?: string;
}; 