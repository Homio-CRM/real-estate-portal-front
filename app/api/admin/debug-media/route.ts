import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    console.log("=== DEBUG MEDIA ITEMS ===");
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const agencyId = process.env.LOCATION_ID;

    console.log("Agency ID:", agencyId);

    // Teste 1: Verificar se existem media_items
    console.log("Test 1: Checking media_items table...");
    const { data: allMedia, error: mediaError } = await supabase
      .from('media_item')
      .select('*')
      .limit(10);

    if (mediaError) {
      console.error("Media items error:", mediaError);
      return NextResponse.json({ error: "Media items query failed" }, { status: 500 });
    }

    console.log("Total media items found:", allMedia?.length || 0);
    console.log("Sample media items:", allMedia);

    // Teste 2: Verificar listings da agência
    console.log("Test 2: Checking listings for agency...");
    const { data: listings, error: listingsError } = await supabase
      .from('listing')
      .select('listing_id, title, agency_id')
      .eq('agency_id', agencyId)
      .limit(5);

    if (listingsError) {
      console.error("Listings error:", listingsError);
      return NextResponse.json({ error: "Listings query failed" }, { status: 500 });
    }

    console.log("Listings found for agency:", listings?.length || 0);
    console.log("Sample listings:", listings);

    // Teste 3: Verificar media_items para os listings da agência
    if (listings && listings.length > 0) {
      console.log("Test 3: Checking media_items for agency listings...");
      const listingIds = listings.map(l => l.listing_id);
      
      const { data: agencyMedia, error: agencyMediaError } = await supabase
        .from('media_item')
        .select('*')
        .in('listing_id', listingIds);

      if (agencyMediaError) {
        console.error("Agency media error:", agencyMediaError);
      } else {
        console.log("Media items for agency listings:", agencyMedia?.length || 0);
        console.log("Sample agency media:", agencyMedia);
      }
    }

    // Teste 4: Query JOIN como na API principal
    console.log("Test 4: Testing JOIN query...");
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
      console.log("JOIN query result:", joinData?.length || 0);
      console.log("Sample JOIN data:", joinData);
    }

    const result = {
      agency_id: agencyId,
      total_media_items: allMedia?.length || 0,
      sample_media_items: allMedia || [],
      agency_listings: listings?.length || 0,
      sample_listings: listings || [],
      join_query_results: joinData?.length || 0,
      sample_join_data: joinData || []
    };

    console.log("=== END DEBUG MEDIA ITEMS ===");
    return NextResponse.json(result);

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

