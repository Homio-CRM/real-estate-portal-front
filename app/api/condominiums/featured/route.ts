import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

// Funções utilitárias
function formatPrice(minPrice?: number | null, maxPrice?: number | null): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  } else if (minPrice) {
    return `A partir de ${formatCurrency(minPrice)}`;
  }
  return "Preço sob consulta";
}

function formatArea(minArea?: number | null, maxArea?: number | null): string {
  if (minArea && maxArea && minArea !== maxArea) {
    return `${minArea} - ${maxArea} m²`;
  } else if (minArea) {
    return `A partir de ${minArea} m²`;
  }
  return "Área sob consulta";
}

function getCityName(cityId?: number | null): string {
  const cities: Record<number, string> = {
    3205309: 'Vitória - ES',
    3205200: 'Vila Velha - ES', 
    3205002: 'Serra - ES',
    3201308: 'Cariacica - ES',
    3106200: 'Belo Horizonte - MG'
  };
  return cities[cityId || 0] || 'Cidade não identificada';
}

export async function GET(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  const limit = Math.max(1, Number(searchParams.get("limit") || 6));
  const offset = Math.max(0, Number(searchParams.get("offset") || 0));
  

  try {
    const agencyId = process.env.LOCATION_ID;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }


    // Usar a tabela/view condominium_search que já tem todos os dados combinados
    // Removemos o filtro de cidade para mostrar todos os lançamentos disponíveis
    let query = supabaseAgent
      .from('condominium_search')
      .select('*')
      .eq('is_launch', true)
      .not('name', 'like', '%trevas%');

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    if (cityId) {
      query = query.eq('city_id', Number(cityId));
    }

    // Apply range pagination (Supabase doesn't support offset(); use range instead)
    const rangeStart = offset;
    const rangeEnd = offset + limit - 1;
    const { data: results, error } = await query.range(rangeStart, rangeEnd);

    if (error) {
      console.error("Error fetching featured condominiums:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!results || results.length === 0) {
      return NextResponse.json([]);
    }

    // Transformar os resultados da condominium_search para o formato esperado
    const featuredResults = results.map((item: Record<string, unknown>) => ({
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
      display_address: item.display_address || `${item.neighborhood}, ${getCityName(item.city_id as number | null)}`,
      neighborhood: item.neighborhood,
      address: item.address,
      street_number: item.street_number,
      postal_code: item.postal_code,
      latitude: item.latitude,
      longitude: item.longitude,
      
      // Campos calculados para compatibilidade
      image: item.primary_media_url || "/placeholder-property.jpg",
      price: formatPrice(item.min_price as number | null, item.max_price as number | null),
      area_range: formatArea(item.min_area as number | null, item.max_area as number | null),
      media_count: 0, // A condominium_search não tem essa info, deixamos 0
      features: item.features || {}
    }));


    return NextResponse.json(featuredResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
