import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(req: NextRequest) {
  const agencyId = process.env.LOCATION_ID!;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const locationId = searchParams.get("id");
  const type = searchParams.get("type");

  if (!query && !locationId) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    if (locationId) {
      if (type === "city") {
        const { data, error } = await supabaseAgent
          .from("city")
          .select("id, name")
          .eq("id", locationId)
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      } else {
        return NextResponse.json({ 
          error: "Busca por ID de bairro não suportada - neighborhood é um campo de texto" 
        }, { status: 400 });
      }
    }

    // Buscar cidades
    const { data: cities, error: citiesError } = await supabaseAgent
      .from("city")
      .select("id, name")
      .ilike("name", `${query}%`)
      .order("name")
      .limit(10);

    if (citiesError) {
      return NextResponse.json({ error: citiesError.message }, { status: 500 });
    }

    // Buscar bairros únicos
    const { data: neighborhoodData, error: neighborhoodsError } = await supabaseAgent
      .from("entity_location")
      .select("neighborhood, city_id")
      .not("neighborhood", "is", null)
      .not("neighborhood", "eq", "")
      .ilike("neighborhood", `${query}%`)
      .limit(50);

    if (neighborhoodsError) {
      return NextResponse.json({ error: neighborhoodsError.message }, { status: 500 });
    }

    // Buscar os nomes das cidades dos bairros
    const neighborhoodCityIds = [...new Set(neighborhoodData.map((n: { city_id: number }) => n.city_id))];
    const { data: neighborhoodCities, error: neighborhoodCitiesError } = await supabaseAgent
      .from("city")
      .select("id, name")
      .in("id", neighborhoodCityIds);

    if (neighborhoodCitiesError) {
      return NextResponse.json({ error: neighborhoodCitiesError.message }, { status: 500 });
    }

    // Processar bairros: remover duplicatas e normalizar formatação
    const uniqueNeighborhoods = new Map<string, any>();
    
    neighborhoodData.forEach((location: { neighborhood: string; city_id: number }) => {
      const key = `${location.neighborhood.toLowerCase()}-${location.city_id}`;
      if (!uniqueNeighborhoods.has(key)) {
        // Normalizar a formatação: primeira letra maiúscula, resto minúscula
        const normalizedName = location.neighborhood
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        const cityName = neighborhoodCities.find(city => city.id === location.city_id)?.name || '';
        
        uniqueNeighborhoods.set(key, {
          id: uniqueNeighborhoods.size + 10000,
          name: normalizedName,
          type: 'neighborhood',
          city_name: cityName,
          city_id: location.city_id
        });
      }
    });

    const neighborhoods = Array.from(uniqueNeighborhoods.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .slice(0, 10);

    // Formatar cidades com tipo
    const formattedCities = cities.map(city => ({
      id: city.id,
      name: city.name,
      type: 'city',
      city_name: city.name,
      city_id: city.id
    }));

    const result = {
      neighborhoods: neighborhoods,
      cities: formattedCities
    };

    if (result.neighborhoods.length === 0 && result.cities.length === 0) {
      return NextResponse.json({ 
        error: `Não há locais disponíveis que começam com "${query}"` 
      }, { status: 404 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in locations API:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 