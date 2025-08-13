import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import { translatePropertyTypeToDB } from "../../../lib/propertyTypes";

interface OptimizedListingRow {
  listing_id: string;
  title: string;
  transaction_type: string;
  virtual_tour?: string | null;
  agency_id: string;
  transaction_status: string;
  construction_status?: string | null;
  occupation_status?: string | null;
  is_public: boolean;
  property_type: string;
  usage_type?: string | null;
  external_ref?: string | null;
  list_price_amount?: number | null;
  list_price_currency?: string | null;
  rental_period?: string | null;
  iptu_amount?: number | null;
  iptu_currency?: string | null;
  iptu_period?: string | null;
  property_administration_fee_amount?: number | null;
  property_administration_fee_currency?: string | null;
  public_id?: string | null;
  condominium_id?: string | null;
  key_location?: string | null;
  key_location_other?: string | null;
  spu?: string | null;
  description?: string | null;
  area?: number | null;
  bathroom_count?: number | null;
  bedroom_count?: number | null;
  garage_count?: number | null;
  floors_count?: number | null;
  unit_floor?: number | null;
  buildings_count?: number | null;
  suite_count?: number | null;
  year_built?: number | null;
  total_area?: number | null;
  private_area?: number | null;
  land_area?: number | null;
  built_area?: number | null;
  solar_position?: string | null;
  display_address: string;
  neighborhood?: string | null;
  street_number?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  primary_image_url?: string | null;
  for_rent: boolean;
  price_formatted: string;
  iptu_formatted?: string | null;
  media_count?: number | null;
  media?: Array<{ id?: string; url?: string; caption?: string | null; is_primary?: boolean; order?: number }>; 
}

export async function GET(request: Request) {
  console.log("=== API LISTING ROUTE OPTIMIZED ===");
  
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  const transactionType = searchParams.get("transactionType");
  const tipo = searchParams.get("tipo");
  const bairro = searchParams.get("bairro");
  const limit = Number(searchParams.get("limit") || 30);
  const offset = Number(searchParams.get("offset") || 0);
  
  console.log("API received params:", {
    cityId,
    transactionType,
    tipo,
    bairro,
    limit,
    offset
  });
  
  if (!cityId || !transactionType) {
    console.log("Missing required params");
    return NextResponse.json({ error: "cityId e transactionType são obrigatórios" }, { status: 400 });
  }

  try {
    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      console.log("Agency ID not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const fetchFromDb = async (dbTransactionType: "sale" | "rent") => {
      const dbPropertyType = tipo ? translatePropertyTypeToDB(tipo) : null;

      console.log("Using optimized query with params:", {
        cityId: Number(cityId),
        transactionType: dbTransactionType,
        agencyId,
        neighborhood: bairro,
        propertyType: dbPropertyType,
        limit,
        offset
      });

      const { data, error } = await supabaseAgent.rpc('get_listings_optimized', {
        p_city_id: Number(cityId),
        p_transaction_type: dbTransactionType,
        p_agency_id: agencyId,
        p_neighborhood: bairro || null,
        p_property_type: dbPropertyType,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        throw error;
      }

      return data || [];
    };

    let results: OptimizedListingRow[] = []; // Changed type to any[] as OptimizedListingRow is removed
    try {
      if (transactionType === "all") {
        const [saleResults, rentResults] = await Promise.all([
          fetchFromDb("sale"),
          fetchFromDb("rent")
        ]);
        results = [...saleResults, ...rentResults];
      } else {
        const singleResults = await fetchFromDb(transactionType === "rent" ? "rent" : "sale");
        results = singleResults;
      }
    } catch (dbError) {
      console.error("Optimized query error:", dbError);
      return NextResponse.json({ error: (dbError as Error).message }, { status: 500 });
    }

    // Transformando os resultados para o formato esperado pelo frontend
    const transformedResults = (results || []).map((item: OptimizedListingRow) => ({
      listing_id: item.listing_id,
      title: item.title,
      transaction_type: item.transaction_type,
      virtual_tour: item.virtual_tour,
      agency_id: item.agency_id,
      transaction_status: item.transaction_status,
      construction_status: item.construction_status,
      occupation_status: item.occupation_status,
      is_public: item.is_public,
      property_type: item.property_type,
      usage_type: item.usage_type,
      external_ref: item.external_ref,
      list_price_amount: item.list_price_amount,
      list_price_currency: item.list_price_currency,
      rental_period: item.rental_period,
      iptu_amount: item.iptu_amount,
      iptu_currency: item.iptu_currency,
      iptu_period: item.iptu_period,
      property_administration_fee_amount: item.property_administration_fee_amount,
      property_administration_fee_currency: item.property_administration_fee_currency,
      public_id: item.public_id,
      condominium_id: item.condominium_id,
      key_location: item.key_location,
      key_location_other: item.key_location_other,
      spu: item.spu,
      
      // Detalhes da propriedade
      description: item.description,
      area: item.area,
      bathroom_count: item.bathroom_count,
      bedroom_count: item.bedroom_count,
      garage_count: item.garage_count,
      floors_count: item.floors_count,
      unit_floor: item.unit_floor,
      buildings_count: item.buildings_count,
      suite_count: item.suite_count,
      year_built: item.year_built,
      total_area: item.total_area,
      private_area: item.private_area,
      land_area: item.land_area,
      built_area: item.built_area,
      solar_position: item.solar_position,
      
      // Localização
      display_address: item.display_address,
      neighborhood: item.neighborhood,
      address: item.display_address,
      street_number: item.street_number,
      postal_code: item.postal_code,
      latitude: item.latitude,
      longitude: item.longitude,
      
      // Campos calculados para compatibilidade
      image: item.primary_image_url || "/placeholder-property.jpg",
      forRent: item.for_rent,
      price: item.price_formatted,
      iptu: item.iptu_formatted,
      media_count: item.media_count,
      media: item.media || []
    }));

    console.log("Optimized query results count:", transformedResults.length);
    console.log("Sample result with media:", transformedResults[0] ? {
      listing_id: transformedResults[0].listing_id,
      media_count: transformedResults[0].media_count,
      media: transformedResults[0].media
    } : "No results");
    console.log("=== END API LISTING ROUTE OPTIMIZED ===");

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
