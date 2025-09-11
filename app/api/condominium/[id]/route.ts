import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

interface MediaItem {
  id: string;
  url: string;
  caption: string;
  is_primary: boolean;
  order: number;
}

interface ListingSearchItem {
  listing_id: string;
  title: string;
  transaction_type: string;
  agency_id: string;
  list_price_amount: number;
  primary_media_url: string;
  neighborhood: string;
  city_id: number;
  state_id: number;
  latitude: number;
  longitude: number;
  bedroom_count: number;
  bathroom_count: number;
  garage_count: number;
  total_area: number;
  private_area: number;
  built_area: number;
  land_area: number;
}

interface ApartmentData {
  listing_id: string;
  title: string;
  transaction_type: string;
  agency_id: string;
  list_price_amount: number;
  condominium_id: string;
  public_id: string;
  description: string;
  area: number;
  bathroom_count: number;
  bedroom_count: number;
  garage_count: number;
  suite_count: number;
  year_built: number;
  display_address: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  city_id: number;
  state_id: number;
  primary_image_url: string;
  media_count: number;
  media: MediaItem[];
  price_formatted: string;
  for_rent: boolean;
  price: string;
  forRent: boolean;
  image: string;
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

    // Primeiro, buscar os listing_ids dos apartamentos deste condomínio
    const { data: apartmentListingIds, error: apartmentIdsError } = await supabaseAgent
      .from("listing")
      .select("listing_id")
      .eq("condominium_id", id)
      .eq("agency_id", condominium.agency_id);

    if (apartmentIdsError) {
      console.error("Error fetching apartment listing IDs:", apartmentIdsError);
    }

    const apartments: ApartmentData[] = [];
    if (apartmentListingIds && apartmentListingIds.length > 0) {
      const listingIds = apartmentListingIds.map(l => l.listing_id);

      // Agora buscar os dados otimizados usando a listing_search
      const { data: apartmentListings, error: apartmentError } = await supabaseAgent
        .from("listing_search")
        .select(`
          listing_id,
          title,
          transaction_type,
          agency_id,
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
        .in("listing_id", listingIds);

      if (apartmentError) {
        console.error("Error fetching apartment listings:", apartmentError);
      }


      if (apartmentListings && apartmentListings.length > 0) {
        // Processar listings usando a mesma lógica da API /api/listing
        const results = await Promise.all((apartmentListings || []).map(async (item: ListingSearchItem) => {
          let allMedia: MediaItem[] = [];
          let mediaCount = 0;
          
          // Se tem imagem primária, buscar todas as mídias
          if (item.primary_media_url) {
            const { data: mediaData, error: mediaError } = await supabaseAgent
              .from('media_item')
              .select('id, url, caption, is_primary, order')
              .eq('listing_id', item.listing_id)
              .order('order', { ascending: true });

            if (mediaError) {
              console.error(`Media error for listing ${item.listing_id}:`, mediaError);
              // Fallback para apenas a imagem primária
              allMedia = [{
                id: 'primary',
                url: item.primary_media_url,
                caption: 'Imagem principal',
                is_primary: true,
                order: 1
              }];
              mediaCount = 1;
            } else if (mediaData && mediaData.length > 0) {
              // Tem mídias na tabela media_item
              allMedia = mediaData;
              mediaCount = allMedia.length;
            } else {
              // Não tem mídias na tabela media_item, usar apenas a primária da materialized view
              allMedia = [{
                id: 'primary',
                url: item.primary_media_url,
                caption: 'Imagem principal',
                is_primary: true,
                order: 1
              }];
              mediaCount = 1;
            }
          }
          
          // Construir endereço baseado nos dados da match view
          const displayAddress = item.neighborhood 
            ? `${item.neighborhood}, ${getCityName(item.city_id)}`
            : getCityName(item.city_id);

          const result = {
            listing_id: item.listing_id,
            title: item.title,
            transaction_type: item.transaction_type,
            agency_id: item.agency_id,
            list_price_amount: item.list_price_amount,
            condominium_id: id, // Usar o id do condomínio atual
            public_id: item.listing_id,
            description: "Imóvel em excelente localização com acabamento de alto padrão.",
            area: item.total_area || item.private_area || item.built_area || 120,
            bathroom_count: item.bathroom_count || 2,
            bedroom_count: item.bedroom_count || 3,
            garage_count: item.garage_count || 2,
            suite_count: 1, // Não temos este campo na match view
            year_built: 2020, // Não temos este campo na match view
            display_address: displayAddress,
            neighborhood: item.neighborhood || 'Bairro não informado',
            address: displayAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            city_id: item.city_id,
            state_id: item.state_id,
            primary_image_url: item.primary_media_url || "/placeholder-property.jpg",
            media_count: mediaCount,
            media: allMedia.map((m: MediaItem) => ({
              id: m.id,
              url: m.url,
              caption: m.caption,
              is_primary: m.is_primary,
              order: m.order
            })),
            price_formatted: item.list_price_amount ? `R$ ${item.list_price_amount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
            for_rent: item.transaction_type === 'rent',
            price: item.list_price_amount ? `R$ ${item.list_price_amount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
            forRent: item.transaction_type === 'rent',
            image: item.primary_media_url || "/placeholder-property.jpg",
          };
          
          return result;
        }));

        apartments.push(...results);
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



