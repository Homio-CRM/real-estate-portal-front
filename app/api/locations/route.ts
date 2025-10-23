import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(req: NextRequest) {
  console.log("=== API LOCATIONS ROUTE CALLED ===");
  const agencyId = process.env.LOCATION_ID!;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const locationId = searchParams.get("id");
  const type = searchParams.get("type");

  console.log("Locations API params:", { query, locationId, type, agencyId });

  if (!query && !locationId) {
    console.log("Missing query parameter");
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
    } else {
      // Busca simplificada por query
      console.log("Searching for locations with query:", query);
      
      // Buscar cidades que começam com a query
      const { data: cities, error: citiesError } = await supabaseAgent
        .from("city")
        .select("id, name")
        .ilike("name", `${query}%`)
        .order("name")
        .limit(5);

      if (citiesError) {
        console.error("Cities query error:", citiesError);
        return NextResponse.json({ error: citiesError.message }, { status: 500 });
      }

      // Buscar bairros que começam com a query (com join para pegar o nome da cidade)
      const { data: neighborhoods, error: neighborhoodsError } = await supabaseAgent
        .from("entity_location")
        .select(`
          neighborhood, 
          city_id,
          city!inner(id, name)
        `)
        .ilike("neighborhood", `${query}%`)
        .not("neighborhood", "is", null)
        .not("neighborhood", "eq", "")
        .limit(10);

      if (neighborhoodsError) {
        console.error("Neighborhoods query error:", neighborhoodsError);
        return NextResponse.json({ error: neighborhoodsError.message }, { status: 500 });
      }

      // Remover duplicatas e formatar dados
      const uniqueNeighborhoods = new Map();
      (neighborhoods || []).forEach((item: any) => {
        // Normalizar o nome do bairro (primeira letra maiúscula, resto minúsculo)
        const normalizedName = item.neighborhood
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        const key = `${normalizedName}-${item.city_id}`;
        if (!uniqueNeighborhoods.has(key)) {
          uniqueNeighborhoods.set(key, {
            id: uniqueNeighborhoods.size + 10001,
            name: normalizedName,
            type: 'neighborhood',
            city_id: item.city_id,
            city_name: item.city?.name || 'Cidade não informada'
          });
        }
      });

      const groupedData = {
        neighborhoods: Array.from(uniqueNeighborhoods.values()).slice(0, 5),
        cities: cities || []
      };

      console.log("=== LOCATIONS API DEBUG ===");
      console.log("Found neighborhoods:", groupedData.neighborhoods.length);
      console.log("Found cities:", groupedData.cities.length);
      console.log("Neighborhoods data:", groupedData.neighborhoods);
      console.log("Cities data:", groupedData.cities);

      return NextResponse.json(groupedData);
    }
  } catch (error) {
    console.error("Locations API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}