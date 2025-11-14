export type FetchListingsParams = {
  cityId: number;
  transactionType: "sale" | "rent" | "all";
  tipo?: string | string[];
  bairro?: string;
  limit?: number;
  offset?: number;
  isLaunch?: boolean;
};

export type EntityLocationResponse = {
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

export type ListingLocationResponse = EntityLocationResponse & {
  entity_type: "listing";
  listing_id: string;
};

export type CondominiumLocationResponse = EntityLocationResponse & {
  entity_type: "condominium";
  condominium_id: string;
};

export type ListingResponse = {
  listing_id: string;
  agency_id: string;
  title: string;
  transaction_type: string;
  virtual_tour?: string;
  transaction_status: string;
  construction_status?: string;
  occupation_status?: string;
  is_public: boolean;
  property_type?: string;
  usage_type?: string;
  external_ref?: string;
  list_price_amount?: number;
  list_price_currency?: string;
  rental_period?: string;
  iptu_amount?: number;
  iptu_currency?: string;
  iptu_period?: string;
  property_administration_fee_amount?: number;
  property_administration_fee_currency?: string;
  public_id?: string;
  condominium_id?: string;
  key_location?: string;
  key_location_other?: string;
  spu?: string;
};

export type CondominiumResponse = {
  id: string;
  name: string;
  agency_id: string;
};

export type ListingDetailsResponse = {
  listing_id: string;
  description?: string;
  area?: number;
  bathroom_count?: number;
  bedroom_count?: number;
  garage_count?: number;
  floors_count?: number;
  unit_floor?: number;
  buildings_count?: number;
  suite_count?: number;
  year_built?: number;
  total_area?: number;
  private_area?: number;
  land_area?: number;
  built_area?: number;
  solar_position?: string;
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

export type MediaItemResponse = {
  id: string;
  entity_type: "listing" | "condominium";
  listing_id?: string;
  condominium_id?: string;
  medium: string;
  caption?: string;
  is_primary: boolean;
  url: string;
  order?: number;
};

export type EntityFeaturesResponse = {
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
  adult_pool?: boolean;
  children_pool?: boolean;
  heated_pool?: boolean;
  lap_pool?: boolean;
  spa?: boolean;
  kids_area?: boolean;
  laundry?: boolean;
  ev_charging?: boolean;
  others?: boolean;
  others_label?: string;
};

export type EntityParticipantResponse = {
  participant_id: string;
  listing_id?: string;
  condominium_id?: string;
  ghl_contact_id: string;
  role: string;
  commission_percentage?: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type RoomTypeResponse = {
  id: number;
  slug: string;
  label: string;
};

export type ListingRoomResponse = {
  listing_id: string;
  room_type_id: number;
  quantity?: number;
  room_type?: RoomTypeResponse;
};

export type FloorFinishResponse = {
  id: number;
  listing_id: string;
  finish_type: string;
  location?: string;
  other_label?: string;
};

export type CityResponse = {
  id: number;
  name: string;
  state_id: number;
}; 