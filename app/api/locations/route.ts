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
    } else {
      try {
        const { data, error } = await supabaseAgent
          .rpc('get_locations_with_properties', {
            p_agency_id: agencyId,
            p_query: query
          });

        if (error) {
          throw new Error('RPC function not available');
        }

        if (!data || data.length === 0) {
          return NextResponse.json({ 
            error: `Não há locais disponíveis que começam com "${query}"` 
          }, { status: 404 });
        }

        const groupedData = {
          neighborhoods: data.filter((item: any) => item.type === 'neighborhood'),
          cities: data.filter((item: any) => item.type === 'city')
        };

        return NextResponse.json(groupedData);
      } catch (rpcError) {
        
        const { data: listings, error: listingsError } = await supabaseAgent
          .from("listing")
          .select("listing_id")
          .eq("agency_id", agencyId);

        if (listingsError) {
          return NextResponse.json({ error: listingsError.message }, { status: 500 });
        }

        if (!listings || listings.length === 0) {
          return NextResponse.json({ neighborhoods: [], cities: [] });
        }

        const listingIds = listings.map((listing: { listing_id: string }) => listing.listing_id);

        // Buscar cidades
        const { data: cityLocations, error: cityLocationsError } = await supabaseAgent
          .from("listing_location")
          .select("city_id")
          .in("listing_id", listingIds);

        if (cityLocationsError) {
          return NextResponse.json({ error: cityLocationsError.message }, { status: 500 });
        }

        const cityIds = [...new Set(cityLocations.map((location: { city_id: number }) => location.city_id))];

        const { data: cities, error: citiesError } = await supabaseAgent
          .from("city")
          .select("id, name")
          .in("id", cityIds)
          .ilike("name", `${query}%`)
          .order("name")
          .limit(10);

        if (citiesError) {
          return NextResponse.json({ error: citiesError.message }, { status: 500 });
        }

        // Buscar bairros
        const { data: neighborhoodLocations, error: neighborhoodLocationsError } = await supabaseAgent
          .from("listing_location")
          .select("neighborhood, city_id")
          .in("listing_id", listingIds)
          .not("neighborhood", "is", null)
          .not("neighborhood", "eq", "");

        if (neighborhoodLocationsError) {
          return NextResponse.json({ error: neighborhoodLocationsError.message }, { status: 500 });
        }

        const uniqueNeighborhoods = [...new Set(
          neighborhoodLocations
            .map((location: { neighborhood: string }) => location.neighborhood)
            .filter((neighborhood: string) => 
              neighborhood && 
              neighborhood.toLowerCase().includes(query!.toLowerCase())
            )
        )].sort();

                 const neighborhoods = uniqueNeighborhoods
           .slice(0, 10)
           .map((name: string, index: number) => ({
             id: index + 10001,
             name: name,
             type: 'neighborhood',
             city_name: 'Vitória', // Placeholder - você pode melhorar isso se necessário
             city_id: 3205309 // ID de Vitória - você pode melhorar isso se necessário
           }));

        const groupedData = {
          neighborhoods: neighborhoods,
          cities: cities || []
        };

        if (groupedData.neighborhoods.length === 0 && groupedData.cities.length === 0) {
          return NextResponse.json({ 
            error: `Não há locais disponíveis que começam com "${query}"` 
          }, { status: 404 });
        }

        return NextResponse.json(groupedData);
      }
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 