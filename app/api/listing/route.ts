import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const stateId = searchParams.get("stateId");
    const transactionType = searchParams.get("transactionType");
    const tipo = searchParams.get("tipo");
    const bairro = searchParams.get("bairro");
    const limit = Number(searchParams.get("limit") || 30);
    const offset = Number(searchParams.get("offset") || 0);
    const useLocationPriority = searchParams.get("useLocationPriority") === "true";
    
    console.log("🏠 [LISTINGS API] Request params:", {
      cityId, stateId, transactionType, tipo, bairro, limit, offset, useLocationPriority
    });
    
    if (!transactionType) {
      return NextResponse.json({ error: "transactionType é obrigatório" }, { status: 400 });
    }

    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      console.error("LOCATION_ID not configured");
      return NextResponse.json({ error: "LOCATION_ID not configured" }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


    // Função para obter prioridade do ad_type
    const getAdTypePriority = (adType: string): number => {
      const priorities: Record<string, number> = {
        'superPremium': 1,
        'premium': 2,
        'premiere1': 3,
        'premiere2': 4,
        'triple': 5,
        'standard': 6,
        'paused': 7
      };
      return priorities[adType] || 8;
    };

    // Função para buscar listings com priorização
    const fetchListingsWithPriority = async (filters: {
      cityId?: number;
      stateId?: number;
      limit: number;
      offset: number;
    }) => {
      let query = supabase
        .from('listing_search')
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
          land_area,
          property_type,
          ad_type
        `)
        .eq('agency_id', agencyId)
        .eq('transaction_type', transactionType === "rent" ? "rent" : "sale");

      // Aplicar filtro de cidade se fornecido
      if (filters.cityId) {
        query = query.eq('city_id', filters.cityId);
      }

      // Aplicar filtro de estado se fornecido (sem cidade)
      if (filters.stateId && !filters.cityId) {
        query = query.eq('state_id', filters.stateId);
      }

      // Aplicar filtro de tipo de propriedade se fornecido
      if (tipo) {
        let propertyType = tipo;
        if (tipo === "Casa") {
          propertyType = "house";
        } else if (tipo === "Apartamento") {
          propertyType = "apartment";
        } else if (tipo === "Condomínio") {
        } else {
          propertyType = tipo;
        }
        
        if (tipo !== "Condomínio") {
          query = query.eq('property_type', propertyType);
        }
      }

      // Aplicar filtro de bairro se fornecido
      if (bairro) {
        query = query.ilike('neighborhood', `%${bairro}%`);
      }

      // Buscar mais resultados para garantir que temos imóveis de alta prioridade
      const searchLimit = Math.max(filters.limit * 3, 30); // Buscar pelo menos 30 ou 3x o limite solicitado
      console.log(`🔍 [LISTINGS API] Searching ${searchLimit} results to ensure high-priority listings are found`);
      
      const { data, error } = await query
        .order('listing_id', { ascending: true })
        .limit(searchLimit)
        .range(filters.offset, filters.offset + searchLimit - 1);

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      return data || [];
    };

    let results: Array<Record<string, unknown>> = [];
    let hasResults = false;

    // Estratégia de busca com priorização
    if (useLocationPriority) {
      console.log("🎯 [LISTINGS API] Using location priority strategy");
      // 1. Buscar por cidade específica
      if (cityId) {
        console.log("📍 [LISTINGS API] STEP 1: Searching by city ID:", cityId);
        try {
          const cityResults = await fetchListingsWithPriority({ 
            cityId: Number(cityId), 
            limit, 
            offset 
          });
          
          if (cityResults.length > 0) {
            console.log(`✅ [LISTINGS API] Found ${cityResults.length} listings in city ${cityId}`);
            results = cityResults;
            hasResults = true;
          } else {
            console.log("❌ [LISTINGS API] No listings found in city, trying state...");
          }
        } catch (error) {
          console.error("❌ [LISTINGS API] Error searching by city:", error);
        }
      }

      // 2. Se não encontrou na cidade, buscar por estado
      if (!hasResults && stateId) {
        console.log("🏛️ [LISTINGS API] STEP 2: Searching by state ID:", stateId);
        try {
          const stateResults = await fetchListingsWithPriority({ 
            stateId: Number(stateId), 
            limit, 
            offset 
          });
          
          if (stateResults.length > 0) {
            console.log(`✅ [LISTINGS API] Found ${stateResults.length} listings in state ${stateId}`);
            results = stateResults;
            hasResults = true;
          } else {
            console.log("❌ [LISTINGS API] No listings found in state, trying any location...");
          }
        } catch (error) {
          console.error("❌ [LISTINGS API] Error searching by state:", error);
        }
      }

      // 3. Se não encontrou nem na cidade nem no estado, buscar qualquer imóvel
      if (!hasResults) {
        console.log("🌍 [LISTINGS API] STEP 3: Searching any location");
        try {
          const anyResults = await fetchListingsWithPriority({ 
            limit, 
            offset 
          });
          
          if (anyResults.length > 0) {
            console.log(`✅ [LISTINGS API] Found ${anyResults.length} listings in any location`);
            results = anyResults;
            hasResults = true;
          }
        } catch (error) {
          console.error("❌ [LISTINGS API] Error searching any location:", error);
        }
      }
    } else {
      // Busca tradicional (sem priorização de localização)
      console.log("📋 [LISTINGS API] Using traditional search strategy");
      const cityIdNumber = cityId ? Number(cityId) : undefined;
      results = await fetchListingsWithPriority({ 
        cityId: cityIdNumber, 
        limit, 
        offset 
      });
      hasResults = results.length > 0;
      console.log(`📋 [LISTINGS API] Traditional search found ${results.length} listings`);
    }

    if (!hasResults) {
      console.log("❌ [LISTINGS API] No listings found with any strategy");
      return NextResponse.json([]);
    }

    console.log(`📊 [LISTINGS API] Total results before sorting: ${results.length}`);

    // Mostrar distribuição dos ad_types antes da ordenação
    const adTypeDistribution = results.reduce((acc: Record<string, number>, item) => {
      const adType = (item.ad_type as string) || 'null';
      acc[adType] = (acc[adType] || 0) + 1;
      return acc;
    }, {});
    console.log("📈 [LISTINGS API] Ad_type distribution before sorting:", adTypeDistribution);

    // Ordenar por prioridade do ad_type PRIMEIRO
    results.sort((a, b) => {
      const priorityA = getAdTypePriority((a.ad_type as string) || 'standard');
      const priorityB = getAdTypePriority((b.ad_type as string) || 'standard');
      return priorityA - priorityB;
    });

    // Agora limitar aos resultados solicitados APÓS a ordenação
    const finalResults = results.slice(0, limit);
    console.log(`🎯 [LISTINGS API] Limited to ${limit} results after sorting by priority`);

    // Mostrar distribuição dos ad_types nos resultados finais
    const adTypeDistributionAfter = finalResults.reduce((acc: Record<string, number>, item) => {
      const adType = (item.ad_type as string) || 'null';
      acc[adType] = (acc[adType] || 0) + 1;
      return acc;
    }, {});
    console.log("🏆 [LISTINGS API] Final ad_type distribution:", adTypeDistributionAfter);

    console.log("✅ [LISTINGS API] Final results sorted by ad_type priority:", 
      finalResults.slice(0, 5).map(r => ({ 
        id: r.listing_id, 
        ad_type: r.ad_type, 
        priority: getAdTypePriority((r.ad_type as string) || 'standard')
      }))
    );

    
    // Debug: mostrar alguns exemplos dos resultados
    if (results && results.length > 0) {
    }

    // Processar listings usando primary_media_url da materialized view e buscar todas as mídias
    const processedResults = await Promise.all(finalResults.map(async (item: Record<string, unknown>) => {
      
      let allMedia: Array<{
        id: string;
        url: string;
        caption: string;
        is_primary: boolean;
        order: number;
      }> = [];
      let mediaCount = 0;
      
      // Se tem imagem primária, buscar todas as mídias
      if (item.primary_media_url) {
        const { data: mediaData, error: mediaError } = await supabase
          .from('media_item')
          .select('id, url, caption, is_primary, order')
          .eq('listing_id', item.listing_id)
          .order('order', { ascending: true });

        if (mediaError) {
          console.error(`Media error for listing ${item.listing_id}:`, mediaError);
          // Fallback para apenas a imagem primária
          allMedia = [{
            id: 'primary',
            url: item.primary_media_url as string,
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
            url: item.primary_media_url as string,
            caption: 'Imagem principal',
            is_primary: true,
            order: 1
          }];
          mediaCount = 1;
        }
      }
      
      // Construir endereço baseado nos dados da match view
      const displayAddress = item.neighborhood 
        ? `${item.neighborhood as string}, ${getCityName(item.city_id as number)}`
        : getCityName(item.city_id as number);

      const result = {
        listing_id: item.listing_id,
        title: item.title,
        transaction_type: item.transaction_type,
        agency_id: item.agency_id,
        list_price_amount: item.list_price_amount,
        public_id: item.listing_id, // Usar listing_id como public_id
        description: "Imóvel em excelente localização com acabamento de alto padrão.",
        area: (item.total_area as number) || (item.private_area as number) || (item.built_area as number) || 120,
        bathroom_count: (item.bathroom_count as number) || 2,
        bedroom_count: (item.bedroom_count as number) || 3,
        garage_count: (item.garage_count as number) || 2,
        suite_count: 1, // Não temos este campo na match view
        year_built: 2020, // Não temos este campo na match view
        display_address: displayAddress,
        neighborhood: (item.neighborhood as string) || 'Bairro não informado',
        address: displayAddress,
        latitude: item.latitude as number,
        longitude: item.longitude as number,
        city_id: item.city_id as number,
        state_id: item.state_id as number,
        primary_image_url: (item.primary_media_url as string) || "/placeholder-property.jpg",
        media_count: mediaCount,
        media: allMedia.map((m) => ({
          id: m.id,
          url: m.url,
          caption: m.caption,
          is_primary: m.is_primary,
          order: m.order
        })),
        price_formatted: item.list_price_amount ? `R$ ${(item.list_price_amount as number).toLocaleString('pt-BR')}` : 'Preço sob consulta',
        for_rent: item.transaction_type === 'rent'
      };
      
      return result;
    }));

    console.log(`🎉 [LISTINGS API] Returning ${processedResults.length} processed items`);
    return NextResponse.json(processedResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
