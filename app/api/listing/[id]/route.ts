import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../../types/database";

type ListingSearchRow = Database["public"]["Views"]["listing_search"]["Row"];
type MediaItemRow = Database["public"]["Tables"]["media_item"]["Row"];

const PLACEHOLDER_IMAGE = "/placeholder-property.jpg";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    const { data: listing, error: listingError } = await supabase
      .from("listing_search")
      .select(`
        listing_id,
        title,
        transaction_type,
        agency_id,
        transaction_status,
        property_type,
        list_price_amount,
        rental_price_amount,
        rental_period,
        primary_media_url,
        display_address,
        neighborhood,
        city_id,
        state_id
      `)
      .eq("listing_id", id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listingTyped = listing as ListingSearchRow;

    const hasValidNeighborhood = listingTyped.neighborhood && 
      listingTyped.neighborhood.trim() !== "" && 
      listingTyped.neighborhood.toLowerCase() !== "bairro não informado" &&
      listingTyped.neighborhood.toLowerCase() !== "bairro nao informado";

    const finalNeighborhood = hasValidNeighborhood 
      ? listingTyped.neighborhood 
      : (listingTyped.neighborhood || null);

    let allMedia: MediaItemRow[] = [];
    let mediaCount = 0;

    if (listingTyped.primary_media_url) {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_item')
        .select('id, url, caption, is_primary, order')
        .eq('listing_id', id)
        .order('order', { ascending: true });

      if (mediaError) {
        allMedia = [{
          id: 'primary',
          url: listingTyped.primary_media_url!,
          caption: 'Imagem principal',
          is_primary: true,
          order: 1,
          entity_type: 'listing',
          medium: 'image',
          condominium_id: null,
          is_public: true,
          listing_id: id
        } as MediaItemRow];
        mediaCount = 1;
      } else if (mediaData && mediaData.length > 0) {
        allMedia = mediaData as MediaItemRow[];
        mediaCount = allMedia.length;
      } else {
        allMedia = [{
          id: 'primary',
          url: listingTyped.primary_media_url!,
          caption: 'Imagem principal',
          is_primary: true,
          order: 1,
          entity_type: 'listing',
          medium: 'image',
          condominium_id: null,
          is_public: true,
          listing_id: id
        } as MediaItemRow];
        mediaCount = 1;
      }
    }

    const listPriceAmount = listingTyped.list_price_amount ? listingTyped.list_price_amount / 100 : null;
    const rentalPriceAmount = listingTyped.rental_price_amount ? listingTyped.rental_price_amount / 100 : null;

    const property = {
      ...listingTyped,
      media: allMedia.map(media => ({
        id: media.id,
        url: media.url,
        caption: media.caption,
        is_primary: media.is_primary,
        order: media.order
      })),
      media_count: mediaCount,
      primary_image_url: listingTyped.primary_media_url,
      forRent: listingTyped.transaction_type === "rent",
      price: listPriceAmount
        ? `R$ ${listPriceAmount.toLocaleString("pt-BR")}`
        : "Preço sob consulta",
      image: listingTyped.primary_media_url || PLACEHOLDER_IMAGE,
      list_price_amount: listPriceAmount,
      rental_price_amount: rentalPriceAmount,
      display_address: listingTyped.display_address || null,
      neighborhood: finalNeighborhood,
      city_id: listingTyped.city_id || null,
      state_id: listingTyped.state_id || null
    };

    return NextResponse.json(property);
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 