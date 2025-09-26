import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(req: NextRequest) {
  console.log('🚀 API /locations: INICIANDO - Endpoint acessado');
  
  try {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const locationId = searchParams.get("id");

    console.log('🚀 API /locations: Parâmetros recebidos:', { query, locationId });

  if (!query && !locationId) {
      console.log('❌ API /locations: Parâmetros obrigatórios ausentes');
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      console.error("LOCATION_ID not configured");
      return NextResponse.json({ error: "LOCATION_ID not configured" }, { status: 500 });
  }

    if (locationId) {
      console.log('🔍 API /locations: Busca por ID específico');
      // Para busca por ID, retornar dados básicos
        return NextResponse.json({ 
        id: parseInt(locationId), 
        name: "Cidade" 
      });
    }

    // Usar função SQL real com filtro de ad_type
    console.log('🏙️ API /locations: Usando função SQL real com filtro de ad_type...');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabaseAgent as any;
    const { data: results, error } = await client
      .rpc('get_locations_with_properties', {
        p_agency_id: agencyId,
        p_query: query
      });

    if (error) {
      console.error("Error fetching locations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ neighborhoods: [], cities: [] });
    }

    // Separar cidades e bairros
    const cities = results
      .filter((item: { type: string }) => item.type === 'city')
      .map((item: { id: number; name: string; city_id: number }) => ({
        id: item.id,
        name: item.name,
        city_id: item.city_id
      }));

    const neighborhoods = results
      .filter((item: { type: string }) => item.type === 'neighborhood')
      .map((item: { id: number; name: string; city_id: number }) => ({
        id: item.city_id, // USAR O CITY_ID COMO ID PRINCIPAL
        name: item.name,
        city_id: item.city_id,
        type: 'neighborhood'
      }));

    console.log('✅ API /locations: Resultados encontrados:', {
      cities: cities,
      neighborhoods: neighborhoods
    });

    return NextResponse.json({
      cities,
      neighborhoods
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 