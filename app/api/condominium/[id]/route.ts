import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: condominium, error: condominiumError } = await supabaseAgent
      .from("condominium")
      .select("*")
      .eq("id", id)
      .single();

    if (condominiumError || !condominium) {
      return NextResponse.json({ error: "Condominium not found" }, { status: 404 });
    }

    const { data: location } = await supabaseAgent
      .from("entity_location")
      .select("*")
      .eq("condominium_id", id)
      .eq("entity_type", "condominium")
      .single();

    const { data: features } = await supabaseAgent
      .from("entity_features")
      .select("*")
      .eq("condominium_id", id)
      .eq("entity_type", "condominium")
      .single();

    const { data: media } = await supabaseAgent
      .from("media_item")
      .select("*")
      .eq("entity_type", "condominium")
      .eq("condominium_id", id)
      .order("is_primary", { ascending: false });

    const condoResponse = {
      ...condominium,
      ...(location || {}),
      ...(features || {}),
      media: media || [],
      image: media?.find(m => m.is_primary)?.url || "/placeholder-property.jpg",
    } as const;

    const { data: apartmentListings } = await supabaseAgent
      .from("listing")
      .select("*")
      .eq("condominium_id", id)
      .eq("property_type", "apartment");

    const apartments = [] as any[];
    if (apartmentListings && apartmentListings.length > 0) {
      const listingIds = apartmentListings.map(l => l.listing_id);

      const [{ data: detailsList }, { data: locationsList }, { data: featuresList }, { data: mediaList }] = await Promise.all([
        supabaseAgent.from("listing_details").select("*").in("listing_id", listingIds),
        supabaseAgent.from("entity_location").select("*").eq("entity_type", "listing").in("listing_id", listingIds),
        supabaseAgent.from("entity_features").select("*").eq("entity_type", "listing").in("listing_id", listingIds),
        supabaseAgent.from("media_item").select("*").eq("entity_type", "listing").in("listing_id", listingIds).order("is_primary", { ascending: false }),
      ]);

      const detailsById = new Map((detailsList || []).map(d => [d.listing_id, d]));
      const locationById = new Map((locationsList || []).map(l => [l.listing_id, l]));
      const featuresById = new Map((featuresList || []).map(f => [f.listing_id, f]));
      const mediaById = new Map<string, any[]>([]);
      (mediaList || []).forEach(m => {
        const key = m.listing_id as string;
        const arr = mediaById.get(key) || [];
        arr.push(m);
        mediaById.set(key, arr);
      });

      for (const listing of apartmentListings) {
        const details = detailsById.get(listing.listing_id) as any;
        const loc = locationById.get(listing.listing_id) as any;
        const feat = featuresById.get(listing.listing_id) as any;
        const listingMedia = mediaById.get(listing.listing_id) || [];

        const price = listing.transaction_type === "rental"
          ? (details?.rental_price_amount ? `R$ ${Number(details.rental_price_amount).toLocaleString("pt-BR")}` : "Preço sob consulta")
          : (listing.list_price_amount ? `R$ ${Number(listing.list_price_amount).toLocaleString("pt-BR")}` : "Preço sob consulta");

        apartments.push({
          ...listing,
          ...(details || {}),
          ...(loc || {}),
          ...(feat || {}),
          media: listingMedia,
          forRent: listing.transaction_type === "rental",
          price,
          iptu: details?.iptu_amount ? `R$ ${Number(details.iptu_amount).toLocaleString("pt-BR")}` : undefined,
          image: (listingMedia.find(m => m.is_primary)?.url) || "/placeholder-property.jpg",
        });
      }
    }

    return NextResponse.json({
      ...condoResponse,
      apartments,
    });
  } catch (error) {
    console.error("Error fetching condominium:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



