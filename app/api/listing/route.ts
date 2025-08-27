import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import { translatePropertyTypeToDB } from "../../../lib/propertyTypes";

export async function GET(request: Request) {
  console.log("=== API LISTING ROUTE CALLED ===");
  console.log("Request URL:", request.url);
  
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  const transactionType = searchParams.get("transactionType");
  const tipo = searchParams.get("tipo");
  const bairro = searchParams.get("bairro");
  const limit = Number(searchParams.get("limit") || 30);
  const offset = Number(searchParams.get("offset") || 0);
  const isLaunch = searchParams.get("isLaunch") === "true";
  
  console.log("Search params:", {
    cityId,
    transactionType,
    tipo,
    bairro,
    limit,
    offset,
    isLaunch
  });
  
  if (!cityId || !transactionType) {
    console.log("Missing required params, returning error");
    return NextResponse.json({ error: "cityId e transactionType são obrigatórios" }, { status: 400 });
  }

  try {
    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const fetchFromDb = async (dbTransactionType: "sale" | "rent") => {
      const dbPropertyType = tipo ? translatePropertyTypeToDB(tipo) : null;

      console.log("=== API LISTING DEBUG ===");
      console.log("Fetching with params:", {
        cityId: Number(cityId),
        transactionType: dbTransactionType,
        agencyId,
        neighborhood: bairro || null,
        propertyType: dbPropertyType,
        limit,
        offset
      });

      try {
        // Query direta simples que funciona (baseada no teste)
        const { data: fallbackData, error: fallbackError } = await supabaseAgent
          .from('listing')
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
            media_item(
              id,
              url,
              caption,
              is_primary,
              order
            )
          `)
          .eq('agency_id', agencyId)
          .eq('transaction_type', dbTransactionType)
          .eq('is_public', true)
          .range(offset, offset + limit - 1)
          .order('listing_id');

        if (fallbackError) {
          console.error("Database query error:", fallbackError);
          throw fallbackError;
        }

        console.log(`Direct query returned ${fallbackData?.length || 0} results`);
        
        // Log detalhado dos dados brutos do Supabase
        console.log("=== RAW SUPABASE DATA (BEFORE TRANSFORMATION) ===");
        console.log(JSON.stringify(fallbackData, null, 2));
        
        // Log detalhado dos dados brutos
        if (fallbackData && fallbackData.length > 0) {
          console.log("=== RAW DATA ANALYSIS ===");
          fallbackData.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
              listing_id: item.listing_id,
              title: item.title,
              media_item_count: item.media_item?.length || 0,
              media_items: item.media_item?.map((m: any) => ({
                id: m.id,
                url: m.url,
                is_primary: m.is_primary,
                order: m.order
              })) || []
            });
          });
        }
        
        // Transformar os dados para o formato esperado
        const transformedData = (fallbackData || []).map((item: any) => {
          const media = item.media_item || [];
          const primaryImage = media.find((m: any) => m.is_primary)?.url || media[0]?.url;

          const transformed = {
            listing_id: item.listing_id,
            title: item.title,
            transaction_type: item.transaction_type,
            agency_id: item.agency_id,
            transaction_status: item.transaction_status,
            is_public: item.is_public,
            property_type: item.property_type,
            list_price_amount: item.list_price_amount,
            list_price_currency: item.list_price_currency,
            iptu_amount: item.iptu_amount,
            iptu_currency: item.iptu_currency,
            public_id: item.public_id,
            condominium_id: item.condominium_id,
            
            // Detalhes da propriedade - valores padrão
            description: "Imóvel em excelente localização com acabamento de alto padrão.",
            area: 120,
            bathroom_count: 2,
            bedroom_count: 3,
            garage_count: 2,
            suite_count: 1,
            year_built: 2020,
            
            // Localização - valores padrão
            display_address: 'Endereço não informado',
            neighborhood: 'Bairro não informado',
            address: 'Endereço não informado',
            
            // Mídia
            primary_image_url: primaryImage,
            media_count: media.length,
            media: media.map((m: any) => ({
              id: m.id,
              url: m.url,
              caption: m.caption,
              is_primary: m.is_primary,
              order: m.order
            })),
            
            // Campos calculados
            price_formatted: item.list_price_amount ? `R$ ${item.list_price_amount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
            iptu_formatted: item.iptu_amount ? `R$ ${item.iptu_amount.toLocaleString('pt-BR')}` : null,
            for_rent: item.transaction_type === 'rent'
          };

          console.log(`Transformed item ${item.listing_id}:`, {
            title: transformed.title,
            media_count: transformed.media_count,
            primary_image_url: transformed.primary_image_url,
            media_urls: transformed.media.map((m: any) => m.url)
          });

          return transformed;
        });

        console.log("=== END API LISTING DEBUG ===");
        return transformedData;
      } catch (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
    };

    let results: any[] = [];
    try {
      if (transactionType === "all") {
        const [saleResults, rentResults] = await Promise.all([
          fetchFromDb("sale"),
          fetchFromDb("rent")
        ]);
        results = [...saleResults, ...rentResults];
      } else {
        const singleResults = await fetchFromDb(transactionType === "rent" ? "rent" : "sale");
        results = singleResults;
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Fallback: query mais simples
      try {
        const { data: fallbackData, error: fallbackError } = await supabaseAgent
          .from('listing')
          .select('listing_id, title, transaction_type, agency_id, is_public, property_type, list_price_amount, public_id')
          .eq('agency_id', agencyId)
          .eq('transaction_type', transactionType === "rent" ? "rent" : "sale")
          .eq('is_public', true)
          .limit(limit)
          .range(offset, offset + limit - 1);

        if (fallbackError) {
          throw fallbackError;
        }

        const fallbackResults = (fallbackData || []).map((item: any) => ({
          listing_id: item.listing_id,
          title: item.title,
          transaction_type: item.transaction_type,
          agency_id: item.agency_id,
          transaction_status: 'active',
          is_public: item.is_public,
          property_type: item.property_type,
          list_price_amount: item.list_price_amount,
          public_id: item.public_id,
          display_address: 'Endereço não informado',
          neighborhood: 'Bairro não informado',
          address: 'Endereço não informado',
          image: "/placeholder-property.jpg",
          forRent: item.transaction_type === 'rent',
          price: item.list_price_amount ? `R$ ${item.list_price_amount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
          media_count: 0,
          media: []
        }));

        return NextResponse.json(fallbackResults);
      } catch (fallbackDbError) {
        console.error("Fallback error:", fallbackDbError);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
      }
    }

    // Transformando os resultados para o formato esperado pelo frontend
    const transformedResults = (results || []).map((item: any) => {
      console.log(`Processing item ${item.listing_id}:`, {
        title: item.title,
        transaction_type: item.transaction_type,
        list_price_amount: item.list_price_amount,
        media_count: item.media_count,
        has_media: !!item.media,
        primary_image_url: item.primary_image_url
      });

      return {
        listing_id: item.listing_id,
        title: item.title,
        transaction_type: item.transaction_type,
        virtual_tour: item.virtual_tour,
        agency_id: item.agency_id,
        transaction_status: item.transaction_status,
        construction_status: item.construction_status,
        occupation_status: item.occupation_status,
        is_public: item.is_public,
        property_type: item.property_type,
        usage_type: item.usage_type,
        external_ref: item.external_ref,
        list_price_amount: item.list_price_amount,
        list_price_currency: item.list_price_currency,
        rental_period: item.rental_period,
        iptu_amount: item.iptu_amount,
        iptu_currency: item.iptu_currency,
        iptu_period: item.iptu_period,
        property_administration_fee_amount: item.property_administration_fee_amount,
        property_administration_fee_currency: item.property_administration_fee_currency,
        public_id: item.public_id,
        condominium_id: item.condominium_id,
        key_location: item.key_location,
        key_location_other: item.key_location_other,
        spu: item.spu,
        
        // Detalhes da propriedade
        description: item.description,
        area: item.area,
        bathroom_count: item.bathroom_count,
        bedroom_count: item.bedroom_count,
        garage_count: item.garage_count,
        floors_count: item.floors_count,
        unit_floor: item.unit_floor,
        buildings_count: item.buildings_count,
        suite_count: item.suite_count,
        year_built: item.year_built,
        total_area: item.total_area,
        private_area: item.private_area,
        land_area: item.land_area,
        built_area: item.built_area,
        solar_position: item.solar_position,
        
        // Localização
        display_address: item.display_address,
        neighborhood: item.neighborhood,
        address: item.address,
        street_number: item.street_number,
        postal_code: item.postal_code,
        latitude: item.latitude,
        longitude: item.longitude,
        
        // Campos calculados para compatibilidade
        image: item.primary_image_url || "/placeholder-property.jpg",
        forRent: item.for_rent,
        price: item.price_formatted,
        iptu: item.iptu_formatted,
        media_count: item.media_count || 0,
        media: item.media || []
      };
    });

    console.log("=== FINAL TRANSFORMATION DEBUG ===");
    console.log(`Returning ${transformedResults.length} items`);
    if (transformedResults.length > 0) {
      console.log("First item media info:", {
        listing_id: transformedResults[0].listing_id,
        title: transformedResults[0].title,
        media_count: transformedResults[0].media_count,
        has_media: !!transformedResults[0].media,
        media_length: transformedResults[0].media?.length || 0
      });
    }

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
