import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import type { Database } from "../../../types/database";

type OptimizedCondoRow = Database["public"]["Functions"]["get_condominiums_optimized"]["Returns"][number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  const limit = Number(searchParams.get("limit") || 30);
  const offset = Number(searchParams.get("offset") || 0);


  if (!cityId) {

    return NextResponse.json({ error: "cityId é obrigatório" }, { status: 400 });
  }

  try {
    const agencyId = process.env.LOCATION_ID;

    if (!agencyId) {

      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }



    // Usando a função otimizada do Supabase
    const { data: results, error } = await supabaseAgent
      .rpc('get_condominiums_optimized', {
        p_city_id: Number(cityId),
        p_agency_id: agencyId,
        p_limit: limit,
        p_offset: offset
      });

    if (error) {
      console.error("Optimized condominium query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transformando os resultados para o formato esperado pelo frontend
    const transformedResults = (results || []).map((item: OptimizedCondoRow) => ({
      id: item.condominium_id,
      name: item.name,
      agency_id: item.agency_id,

      // Detalhes do condomínio
      condominium_id: item.condominium_id,
      is_launch: item.is_launch,
      min_price: item.min_price,
      max_price: item.max_price,
      min_area: item.min_area,
      max_area: item.max_area,
      year_built: item.year_built,
      total_units: item.total_units,
      description: item.description,
      usage_type: item.usage_type,

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
      price: item.price_range_formatted,
      area_range: item.area_range_formatted,
      media_count: item.media_count
    }));



    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 