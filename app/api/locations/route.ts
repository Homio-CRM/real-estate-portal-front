import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import type { Database } from "../../../types/database";

type CityRow = Database["public"]["Tables"]["city"]["Row"];
type EntityLocationRow = Database["public"]["Tables"]["entity_location"]["Row"];

type CityResult = {
  id: number;
  name: string;
  type: "city";
  city_name: string;
  city_id: number;
};

type NeighborhoodResult = {
  id: number;
  name: string;
  type: "neighborhood";
  city_name: string;
  city_id: number;
  neighborhood_name: string;
};

export async function GET(req: NextRequest) {
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
      .not("city_id", "is", null)
      .ilike("neighborhood", `%${query}%`)
      .limit(20);

    if (neighborhoodsError) {
      console.error("Neighborhoods query error:", neighborhoodsError);
      // Continuar sem bairros se houver erro
    }

    let neighborhoods: NeighborhoodResult[] = [];

    if (neighborhoodData && neighborhoodData.length > 0) {
      const typedNeighborhoodData = neighborhoodData as Array<{ neighborhood: string | null; city_id: number | null }>;
      const neighborhoodCityIds = [
        ...new Set(
          typedNeighborhoodData
            .map((entry) => entry.city_id)
            .filter((id): id is number => typeof id === "number")
        ),
      ];
      const { data: neighborhoodCities, error: neighborhoodCitiesError } = await supabaseAgent
        .from("city")
        .select("id, name")
        .in("id", neighborhoodCityIds);

      if (neighborhoodCitiesError) {
        console.error("Neighborhood cities query error:", neighborhoodCitiesError);
        // Continuar sem bairros se houver erro
      } else if (neighborhoodCities) {
        // Processar bairros: remover duplicatas e normalizar formatação
        const uniqueNeighborhoods = new Map<string, NeighborhoodResult>();
        
        typedNeighborhoodData.forEach((location) => {
          if (!location.neighborhood || typeof location.city_id !== "number") {
            return;
          }
          const key = `${location.neighborhood.toLowerCase()}-${location.city_id}`;
          if (!uniqueNeighborhoods.has(key)) {
            const normalizedName = location.neighborhood
              .toLowerCase()
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            const cityName = neighborhoodCities.find(city => city.id === location.city_id)?.name ?? "";
            
            uniqueNeighborhoods.set(key, {
              id: uniqueNeighborhoods.size + 10000,
              name: `${normalizedName}, ${cityName}`,
              type: "neighborhood",
              city_name: cityName,
              city_id: location.city_id,
              neighborhood_name: normalizedName
            });
          }
        });

        neighborhoods = Array.from(uniqueNeighborhoods.values())
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
          .slice(0, 10);
      }
    }

    // Formatar cidades com tipo
    const typedCities = (cities ?? []) as Array<{ id: number; name: string }>;
    const formattedCities: CityResult[] = typedCities.map((city) => ({
      id: city.id,
      name: city.name,
      type: "city",
      city_name: city.name,
      city_id: city.id
    }));

    const result: { neighborhoods: NeighborhoodResult[]; cities: CityResult[] } = {
      neighborhoods,
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