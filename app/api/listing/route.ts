import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

function translatePropertyTypeToDB(propertyType: string): string {
  const translations: { [key: string]: string } = {
    "Casa": "house",
    "Apartamento": "apartment",
    "Condomínio": "condominium",
    "Kitnet": "studio",
    "Loft": "loft",
    "Cobertura": "penthouse",
    "Casa Geminada": "townhouse",
    "Terreno": "land",
    "Comercial": "commercial",
    "Escritório": "office",
    "Loja": "store",
    "Galpão": "warehouse",
  };
  
  return translations[propertyType] || propertyType.toLowerCase();
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

    const dbTransactionType = transactionType === "rent" ? "rent" : "sale";
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
    
    console.log("Debug - property type translation:", {
      original: tipo,
      translated: dbPropertyType
    });

    // Usando a função otimizada do Supabase
    const { data: results, error } = await supabaseAgent
      .rpc('get_listings_optimized', {
        p_city_id: Number(cityId),
        p_transaction_type: dbTransactionType,
        p_agency_id: agencyId,
        p_neighborhood: bairro || null,
        p_property_type: dbPropertyType,
        p_limit: limit,
        p_offset: offset
      });

    if (error) {
      console.error("Optimized query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transformando os resultados para o formato esperado pelo frontend
    const transformedResults = (results || []).map((item: any) => ({
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
      address: item.address,
      street_number: item.street_number,
      postal_code: item.postal_code,
      latitude: item.latitude,
      longitude: item.longitude,
      
      // Campos calculados para compatibilidade
      image: item.primary_image_url || "/placeholder-property.jpg",
      forRent: item.for_rent,
      price: item.price_formatted,
      iptu: item.iptu_formatted,
      media_count: item.media_count
    }));

    console.log("Optimized query results count:", transformedResults.length);
    console.log("=== END API LISTING ROUTE OPTIMIZED ===");

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
