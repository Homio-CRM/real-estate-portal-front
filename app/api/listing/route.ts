import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import { ListingLocationResponse, ListingResponse, ListingDetailsResponse, MediaItemResponse } from "../../../types/api";

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

export async function GET(request: Request) {
  console.log("=== API LISTING ROUTE DEBUG ===");
  
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
    console.log("dbTransactionType:", dbTransactionType);
    console.log("bairro filter:", bairro);

    let query = supabaseAgent
      .from("entity_location")
      .select("listing_id")
      .eq("city_id", Number(cityId))
      .eq("entity_type", "listing")
      .not("listing_id", "is", null);

    if (bairro) {
      query = query.eq("neighborhood", bairro);
      // console.log("Filtering by neighborhood:", bairro);
    }

    const { data: locations, error: locError } = await query;
    if (locError) {
      console.error("Location query error:", locError);
      return NextResponse.json({ error: locError.message }, { status: 500 });
    }
    
    const listingIds = (locations || []).map((loc: { listing_id: string }) => loc.listing_id);
    // console.log("Listing IDs found:", listingIds.length);
    
    if (listingIds.length === 0) {
      // console.log("No listing IDs found, returning empty array");
      return NextResponse.json([]);
    }

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

    // console.log("Listings found:", listings?.length || 0);

    if (!listings || listings.length === 0) {
      return NextResponse.json([]);
    }

    const listingIdsForDetails = listings.map((l: ListingResponse) => l.listing_id);
    
    const { data: details, error: detailsError } = await supabaseAgent
      .from("listing_details")
      .select("*")
      .in("listing_id", listingIdsForDetails);
    
    if (detailsError) {
      console.error("Details query error:", detailsError);
      return NextResponse.json({ error: detailsError.message }, { status: 500 });
    }

    if (!details || details.length === 0) {
      console.error("No details found for listings:", listingIdsForDetails);
    }

    const { data: media, error: mediaError } = await supabaseAgent
      .from("media_item")
      .select("*")
      .eq("entity_type", "listing")
      .in("listing_id", listings.map((l: ListingResponse) => l.listing_id))
      .order("is_primary", { ascending: false });
    
    if (mediaError) {
      console.error("Media query error:", mediaError);
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    const results = listings.map((listing: ListingResponse) => {
      const detail = (details || []).find((d: ListingDetailsResponse) => d.listing_id === listing.listing_id);
      const listingMedia = (media || []).filter((m: MediaItemResponse) => m.listing_id === listing.listing_id);
      const primaryImage = listingMedia.find((m: MediaItemResponse) => m.is_primary);
      
      const isForRent = listing.transaction_type === "rent";
      let price = "Preço sob consulta";
      
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

    let filteredResults = results;
    if (tipo) {
      const dbPropertyType = translatePropertyTypeToDB(tipo);
      filteredResults = results.filter(property => {
        const propertyType = property.property_type?.toLowerCase();
        return propertyType === dbPropertyType.toLowerCase();
      });
    }

    // console.log("Final results count:", filteredResults.length);
    // console.log("=== END API LISTING DEBUG ===");
    
    console.log("Final results count:", filteredResults.length);
    console.log("=== END API LISTING ROUTE DEBUG ===");

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
