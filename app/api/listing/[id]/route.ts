import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {

    const { data: listing, error: listingError } = await supabaseAgent
      .from("listing")
      .select("*")
      .eq("listing_id", id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { data: details } = await supabaseAgent
      .from("listing_details")
      .select("*")
      .eq("listing_id", id)
      .single();

    const { data: location } = await supabaseAgent
      .from("entity_location")
      .select("*")
      .eq("entity_id", id)
      .eq("entity_type", "listing")
      .single();

    const { data: features } = await supabaseAgent
      .from("entity_features")
      .select("*")
      .eq("entity_id", id)
      .eq("entity_type", "listing")
      .single();

    const { data: media } = await supabaseAgent
      .from("media_item")
      .select("*")
      .eq("listing_id", id)
      .order("is_primary", { ascending: false });

    const property = {
      ...listing,
      ...(details || {}),
      ...(location || {}),
      ...(features || {}),
      media: media || [],
      forRent: listing.transaction_type === "rental",
      price: listing.transaction_type === "rental" 
        ? details?.rental_price_amount 
          ? `R$ ${details.rental_price_amount.toLocaleString("pt-BR")}`
          : "Preço sob consulta"
        : details?.list_price_amount
          ? `R$ ${details.list_price_amount.toLocaleString("pt-BR")}`
          : "Preço sob consulta",
      iptu: details?.iptu_amount 
        ? `R$ ${details.iptu_amount.toLocaleString("pt-BR")}`
        : undefined,
      image: media?.find(m => m.is_primary)?.url || "/placeholder-property.jpg",
    };

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 