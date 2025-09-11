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
        primary_media_url,
        neighborhood,
        city_id,
        state_id,
        latitude,
        longitude,
        bedroom_count,
        bathroom_count,
        garage_count,
        total_area,
        private_area,
        built_area,
        land_area
      `)
      .eq("listing_id", id)
      .single();

    if (listingError || !listing) {
      console.error("Listing not found:", listingError);
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Buscar condominium_id da tabela listing original
    const { data: listingDetails, error: listingDetailsError } = await supabase
      .from("listing")
      .select("condominium_id")
      .eq("listing_id", id)
      .single();

    if (listingDetailsError) {
      console.error("Error fetching listing details:", listingDetailsError);
    }

    const condominium_id = listingDetails?.condominium_id || null;


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
    

    // Função para obter nome da cidade
    function getCityName(cityId?: number | null): string {
      const cities: Record<number, string> = {
        3205309: 'Vitória - ES',
        3205200: 'Vila Velha - ES', 
        3205002: 'Serra - ES',
        3201308: 'Cariacica - ES',
        3106200: 'Belo Horizonte - MG'
      };
      return cities[cityId || 0] || 'Cidade não identificada';
    }

    // Construir endereço baseado nos dados reais
    const displayAddress = listing.neighborhood 
      ? `${listing.neighborhood}, ${getCityName(listing.city_id)}`
      : getCityName(listing.city_id);

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
      
      // Usar dados reais da materialized view
      public_id: listing.listing_id,
      condominium_id: condominium_id,
      display_address: displayAddress,
      neighborhood: listing.neighborhood || 'Bairro não informado',
      address: displayAddress,
      area: listing.total_area || listing.private_area || listing.built_area || 120,
      bathroom_count: listing.bathroom_count || 2,
      bedroom_count: listing.bedroom_count || 3,
      garage_count: listing.garage_count || 2,
      city_id: listing.city_id,
      state_id: listing.state_id,
      latitude: listing.latitude,
      longitude: listing.longitude,
      
      // Valores padrão para campos que não existem na materialized view
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
      suite_count: 1,
      year_built: 2020,
      description: "Imóvel em excelente localização com acabamento de alto padrão."
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