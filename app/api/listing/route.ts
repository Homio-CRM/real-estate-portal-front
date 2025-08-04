import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import { ListingLocationResponse, ListingResponse, ListingDetailsResponse } from "../../../types/api";

type MediaItemResponse = {
  id: string;
  listing_id: string;
  medium: string;
  caption?: string;
  is_primary: boolean;
  url: string;
};

function translatePropertyTypeToDB(propertyType: string): string {
  const translations: { [key: string]: string } = {
    "Casa": "house",
    "Apartamento": "apartment",
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

export async function GET(req: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    const agencyId = process.env.LOCATION_ID;
    if (!agencyId) {
      console.error("LOCATION_ID not configured");
      return NextResponse.json({ error: "LOCATION_ID environment variable not configured" }, { status: 500 });
    }

    // Verificar Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const transactionType = searchParams.get("transactionType");
    const cityId = searchParams.get("cityId");
    const bairro = searchParams.get("bairro");
    const tipo = searchParams.get("tipo");
    const limit = Number(searchParams.get("limit") || 30);
    const offset = Number(searchParams.get("offset") || 0);

    if (!transactionType || !cityId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const dbTransactionType = transactionType === "rent" ? "rent" : "sale";

    // Buscar localizações
    let query = supabaseAgent
      .from("entity_location")
      .select("entity_id")
      .eq("city_id", Number(cityId))
      .eq("entity_type", "listing");

    if (bairro) {
      query = query.eq("neighborhood", bairro);
    }

    const { data: locations, error: locError } = await query;
    if (locError) {
      console.error("Location query error:", locError);
      return NextResponse.json({ error: locError.message }, { status: 500 });
    }
    
    const listingIds = (locations || []).map((loc: { entity_id: string }) => loc.entity_id);
    if (listingIds.length === 0) {
      return NextResponse.json([]);
    }

    // Buscar listings
    const { data: listings, error } = await supabaseAgent
      .from("listing")
      .select("*")
      .eq("transaction_type", dbTransactionType)
      .eq("agency_id", agencyId)
      .in("listing_id", listingIds)
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Listing query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json([]);
    }

    // Buscar detalhes
    const listingIdsForDetails = listings.map((l: ListingResponse) => l.listing_id);
    
    const { data: details, error: detailsError } = await supabaseAgent
      .from("listing_details")
      .select("*")
      .in("listing_id", listingIdsForDetails);
    
    if (detailsError) {
      console.error("Details query error:", detailsError);
      return NextResponse.json({ error: detailsError.message }, { status: 500 });
    }

    // Verificar se encontramos detalhes
    if (!details || details.length === 0) {
      console.error("No details found for listings:", listingIdsForDetails);
    }

    // Buscar mídia
    const { data: media, error: mediaError } = await supabaseAgent
      .from("media_item")
      .select("*")
      .in("listing_id", listings.map((l: ListingResponse) => l.listing_id))
      .order("is_primary", { ascending: false });
    
    if (mediaError) {
      console.error("Media query error:", mediaError);
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    // Processar resultados
    const results = listings.map((listing: ListingResponse) => {
      const detail = (details || []).find((d: ListingDetailsResponse) => d.listing_id === listing.listing_id);
      const listingMedia = (media || []).filter((m: MediaItemResponse) => m.listing_id === listing.listing_id);
      const primaryImage = listingMedia.find((m: MediaItemResponse) => m.is_primary);
      
      const isForRent = listing.transaction_type === "rent";
      let price = "Preço sob consulta";
      
      // Usar list_price_amount para compra e aluguel
      if (detail && detail.list_price_amount) {
        const listPrice = detail.list_price_amount;
        price = `R$ ${Number(listPrice).toLocaleString("pt-BR")}`;
      }
      
      return { 
        ...listing, 
        ...detail,
        media: listingMedia,
        image: primaryImage?.url || "/placeholder-property.jpg",
        forRent: isForRent,
        price: price,
        iptu: detail?.iptu_amount 
          ? `R$ ${detail.iptu_amount.toLocaleString("pt-BR")}`
          : undefined,
      };
    });

    // Aplicar filtro de tipo de propriedade se especificado
    let filteredResults = results;
    if (tipo) {
      const dbPropertyType = translatePropertyTypeToDB(tipo);
      filteredResults = results.filter(property => {
        const propertyType = property.property_type?.toLowerCase();
        return propertyType === dbPropertyType.toLowerCase();
      });
    }

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
