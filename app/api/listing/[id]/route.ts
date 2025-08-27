import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log("=== API LISTING DETAIL ROUTE CALLED ===");
  console.log("Listing ID:", id);
  
  try {
    // Query direta que funciona (baseada na homepage)
    const { data: listing, error: listingError } = await supabaseAgent
      .from("listing")
      .select(`
        listing_id,
        title,
        transaction_type,
        agency_id,
        transaction_status,
        is_public,
        property_type,
        list_price_amount,
        list_price_currency,
        iptu_amount,
        iptu_currency,
        public_id,
        condominium_id,
        virtual_tour,
        construction_status,
        occupation_status,
        usage_type,
        external_ref,
        rental_period,
        iptu_period,
        property_administration_fee_amount,
        property_administration_fee_currency,
        key_location,
        key_location_other,
        spu,
        media_item(
          id,
          url,
          caption,
          is_primary,
          order
        )
      `)
      .eq("listing_id", id)
      .single();

    if (listingError || !listing) {
      console.error("Listing not found:", listingError);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    console.log("=== LISTING DETAIL DEBUG ===");
    console.log("Listing found:", {
      listing_id: listing.listing_id,
      title: listing.title,
      media_count: listing.media_item?.length || 0
    });

    // Buscar detalhes adicionais
    const [{ data: details }, { data: location }, { data: features }] = await Promise.all([
      supabaseAgent
        .from("listing_details")
        .select("*")
        .eq("listing_id", id)
        .single(),
      supabaseAgent
        .from("entity_location")
        .select("*")
        .eq("listing_id", id)
        .eq("entity_type", "listing")
        .single(),
      supabaseAgent
        .from("entity_features")
        .select("*")
        .eq("listing_id", id)
        .eq("entity_type", "listing")
        .single()
    ]);

    const media = listing.media_item || [];
    const primaryImage = media.find((m: any) => m.is_primary)?.url || media[0]?.url;

    const property = {
      ...listing,
      ...(details || {}),
      ...(location || {}),
      ...(features || {}),
      media: media.map((m: any) => ({
        id: m.id,
        url: m.url,
        caption: m.caption,
        is_primary: m.is_primary,
        order: m.order
      })),
      media_count: media.length,
      primary_image_url: primaryImage,
      forRent: listing.transaction_type === "rent",
      price: listing.list_price_amount 
        ? `R$ ${listing.list_price_amount.toLocaleString("pt-BR")}`
        : "Preço sob consulta",
      iptu: listing.iptu_amount 
        ? `R$ ${listing.iptu_amount.toLocaleString("pt-BR")}`
        : undefined,
      image: primaryImage || "/placeholder-property.jpg",
    };

    console.log("=== FINAL PROPERTY DEBUG ===");
    console.log("Property media info:", {
      media_count: property.media_count,
      has_media: !!property.media,
      media_length: property.media?.length || 0,
      primary_image_url: property.primary_image_url
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 