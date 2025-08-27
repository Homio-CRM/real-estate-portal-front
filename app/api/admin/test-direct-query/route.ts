import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

export async function GET() {
  try {
    console.log("=== TESTING DIRECT SUPABASE QUERY ===");
    
    const agencyId = process.env.LOCATION_ID;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency ID not configured" }, { status: 500 });
    }

    // Teste 1: Verificar se existem listings
    console.log("Testing listings...");
    const { data: listings, error: listingsError } = await supabaseAgent
      .from('listing')
      .select('listing_id, title, transaction_type')
      .eq('agency_id', agencyId)
      .eq('transaction_type', 'sale')
      .eq('is_public', true)
      .limit(3);

    if (listingsError) {
      console.error("Listings error:", listingsError);
      return NextResponse.json({ error: "Listings query failed" }, { status: 500 });
    }

    console.log(`Found ${listings?.length || 0} listings`);

    // Teste 2: Verificar se existem media_items
    console.log("Testing media_items...");
    const { data: mediaItems, error: mediaError } = await supabaseAgent
      .from('media_item')
      .select('id, listing_id, url, is_primary')
      .not('listing_id', 'is', null)
      .limit(10);

    if (mediaError) {
      console.error("Media error:", mediaError);
      return NextResponse.json({ error: "Media query failed" }, { status: 500 });
    }

    console.log(`Found ${mediaItems?.length || 0} media items`);

    // Teste 3: Query completa com join
    console.log("Testing complete query...");
    const { data: completeData, error: completeError } = await supabaseAgent
      .from('listing')
      .select(`
        listing_id,
        title,
        transaction_type,
        media_item(
          id,
          url,
          caption,
          is_primary,
          order
        )
      `)
      .eq('agency_id', agencyId)
      .eq('transaction_type', 'sale')
      .eq('is_public', true)
      .limit(3);

    if (completeError) {
      console.error("Complete query error:", completeError);
      return NextResponse.json({ error: "Complete query failed" }, { status: 500 });
    }

    console.log(`Complete query returned ${completeData?.length || 0} results`);

    // Teste 4: Verificar um listing específico que sabemos que tem imagens
    console.log("Testing specific listing...");
    const specificListingId = "dd93396f-65c9-4bbe-9762-a68058fc0748"; // "Teste inserção de detalhes"
    const { data: specificData, error: specificError } = await supabaseAgent
      .from('listing')
      .select(`
        listing_id,
        title,
        media_item(
          id,
          url,
          caption,
          is_primary,
          order
        )
      `)
      .eq('listing_id', specificListingId);

    if (specificError) {
      console.error("Specific listing error:", specificError);
    }

    const result = {
      listings: {
        count: listings?.length || 0,
        data: listings || []
      },
      media_items: {
        count: mediaItems?.length || 0,
        data: mediaItems || []
      },
      complete_query: {
        count: completeData?.length || 0,
        data: completeData || []
      },
      specific_listing: {
        count: specificData?.length || 0,
        data: specificData || []
      }
    };

    console.log("=== END TESTING DIRECT SUPABASE QUERY ===");
    return NextResponse.json(result);

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
