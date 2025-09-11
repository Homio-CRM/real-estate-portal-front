import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const agencyId = process.env.LOCATION_ID;


    // Teste 1: Verificar se existem media_items
    const { data: allMedia, error: mediaError } = await supabase
      .from('media_item')
      .select('*')
      .limit(10);

    if (mediaError) {
      console.error("Media items error:", mediaError);
      return NextResponse.json({ error: "Media items query failed" }, { status: 500 });
    }


    // Teste 2: Verificar listings da agência
    const { data: listings, error: listingsError } = await supabase
      .from('listing')
      .select('listing_id, title, agency_id')
      .eq('agency_id', agencyId)
      .limit(5);

    if (listingsError) {
      console.error("Listings error:", listingsError);
      return NextResponse.json({ error: "Listings query failed" }, { status: 500 });
    }


    // Teste 3: Verificar media_items para os listings da agência
    let agencyMedia = null;
    if (listings && listings.length > 0) {
      const listingIds = listings.map(l => l.listing_id);
      
      const { data: mediaData, error: agencyMediaError } = await supabase
        .from('media_item')
        .select('*')
        .in('listing_id', listingIds);

      if (agencyMediaError) {
        console.error("Agency media error:", agencyMediaError);
      } else {
        agencyMedia = mediaData;
      }
    }

    // Teste 4: Query JOIN como na API principal
    const { data: joinData, error: joinError } = await supabase
      .from('listing')
      .select(`
        listing_id, 
        title, 
        agency_id,
        media_item(
          id,
          url,
          caption,
          is_primary,
          order
        )
      `)
      .eq('agency_id', agencyId)
      .limit(3);

    if (joinError) {
      console.error("JOIN query error:", joinError);
    } else {
    }

    const result = {
      agency_id: agencyId,
      total_media_items: allMedia?.length || 0,
      sample_media_items: allMedia || [],
      agency_listings: listings?.length || 0,
      sample_listings: listings || [],
      agency_media_items: agencyMedia?.length || 0,
      sample_agency_media: agencyMedia || [],
      join_query_results: joinData?.length || 0,
      sample_join_data: joinData || []
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
