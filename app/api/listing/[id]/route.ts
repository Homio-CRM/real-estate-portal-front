import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MediaItem } from "@/types/listings";

type MediaItemFromDB = {
  id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  order?: number;
  medium?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    
    // Query usando materialized view listing_search (já tem primary_media_url)
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
        primary_media_url
      `)
      .eq("listing_id", id)
      .single();

    if (listingError || !listing) {
      console.error("Listing not found:", listingError);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }


    // Usar primary_media_url da materialized view e buscar todas as mídias
    
    let allMedia: MediaItem[] = [];
    let mediaCount = 0;
    
    // Se tem imagem primária, buscar todas as mídias
    if (listing.primary_media_url) {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_item')
        .select('id, url, caption, is_primary, order')
        .eq('listing_id', id)
        .order('order', { ascending: true });

      if (mediaError) {
        console.error("Media query error:", mediaError);
        // Fallback para apenas a imagem primária
        allMedia = [{
          id: 'primary',
          entity_type: 'listing' as const,
          listing_id: id,
          medium: 'image',
          url: listing.primary_media_url,
          caption: 'Imagem principal',
          is_primary: true,
          order: 1
        }];
        mediaCount = 1;
      } else if (mediaData && mediaData.length > 0) {
        // Tem mídias na tabela media_item
        allMedia = mediaData.map((item: MediaItemFromDB) => ({
          id: item.id,
          entity_type: 'listing' as const,
          listing_id: id,
          medium: item.medium || 'image',
          url: item.url,
          caption: item.caption,
          is_primary: item.is_primary,
          order: item.order
        }));
        mediaCount = allMedia.length;
      } else {
        // Não tem mídias na tabela media_item, usar apenas a primária da materialized view
        allMedia = [{
          id: 'primary',
          entity_type: 'listing' as const,
          listing_id: id,
          medium: 'image',
          url: listing.primary_media_url,
          caption: 'Imagem principal',
          is_primary: true,
          order: 1
        }];
        mediaCount = 1;
      }
    }
    

    const property = {
      ...listing,
      media: allMedia.map((m: MediaItem) => ({
        id: m.id,
        url: m.url,
        caption: m.caption,
        is_primary: m.is_primary,
        order: m.order
      })),
      media_count: mediaCount,
      primary_image_url: listing.primary_media_url,
      forRent: listing.transaction_type === "rent",
      price: listing.list_price_amount 
        ? `R$ ${listing.list_price_amount.toLocaleString("pt-BR")}`
        : "Preço sob consulta",
      image: listing.primary_media_url || "/placeholder-property.jpg",
      
      // Valores padrão para campos que não existem na materialized view
      public_id: listing.listing_id,
      condominium_id: null,
      virtual_tour: null,
      construction_status: null,
      occupation_status: null,
      usage_type: null,
      external_ref: null,
      rental_period: null,
      iptu_amount: null,
      iptu_currency: null,
      iptu_period: null,
      property_administration_fee_amount: null,
      property_administration_fee_currency: null,
      key_location: null,
      key_location_other: null,
      spu: null,
      list_price_currency: 'BRL',
      iptu: null,
      
      // Valores padrão para campos que podem não existir
      description: "Imóvel em excelente localização com acabamento de alto padrão.",
      area: 120,
      bathroom_count: 2,
      bedroom_count: 3,
      garage_count: 2,
      suite_count: 1,
      year_built: 2020,
      display_address: 'Endereço não informado',
      neighborhood: 'Bairro não informado',
      address: 'Endereço não informado',
      city_id: 1
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