import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  console.log("=== API LISTING ROUTE CALLED ===");
  
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const transactionType = searchParams.get("transactionType");
    const limit = Number(searchParams.get("limit") || 30);
    const offset = Number(searchParams.get("offset") || 0);
    
    console.log("Search params:", { cityId, transactionType, limit, offset });
    
    if (!cityId || !transactionType) {
      return NextResponse.json({ error: "cityId e transactionType são obrigatórios" }, { status: 400 });
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

    console.log("=== LISTING API DEBUG ===");
    console.log("Agency ID:", agencyId);
    console.log("Transaction Type:", transactionType);
    console.log("Limit:", limit);
    console.log("Offset:", offset);

    // Query usando materialized view listing_search (já tem primary_media_url)
    const { data, error } = await supabase
      .from('listing_search')
      .select(`
        listing_id,
        title,
        transaction_type,
        agency_id,
        list_price_amount,
        primary_media_url
      `)
      .eq('agency_id', agencyId)
      .eq('transaction_type', transactionType === "rent" ? "rent" : "sale")
      .order('listing_id', { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log("Raw query result:", data);
    console.log("Number of listings found:", data?.length || 0);

    // Processar listings usando primary_media_url da materialized view e buscar todas as mídias
    const results = await Promise.all((data || []).map(async (item: any) => {
      console.log("Processing listing:", item.listing_id, item.title);
      console.log("Primary media URL from listing_search:", item.primary_media_url);
      
      let allMedia = [];
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
          console.log(`Found ${mediaCount} media items for listing ${item.listing_id}`);
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
          console.log(`No media_item found, using primary from listing_search for listing ${item.listing_id}`);
        }
      }
      
      const result = {
        listing_id: item.listing_id,
        title: item.title,
        transaction_type: item.transaction_type,
        agency_id: item.agency_id,
        list_price_amount: item.list_price_amount,
        public_id: item.listing_id, // Usar listing_id como public_id
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
        primary_image_url: item.primary_media_url || "/placeholder-property.jpg",
        media_count: mediaCount,
        media: allMedia.map((m: any) => ({
          id: m.id,
          url: m.url,
          caption: m.caption,
          is_primary: m.is_primary,
          order: m.order
        })),
        price_formatted: item.list_price_amount ? `R$ ${item.list_price_amount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
        for_rent: item.transaction_type === 'rent'
      };
      
      console.log("Final result for listing:", result.listing_id, "has media:", result.media_count, "primary:", result.primary_image_url);
      return result;
    }));

    console.log(`Returning ${results.length} items`);
    return NextResponse.json(results);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
