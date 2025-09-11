import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const agencyId = process.env.LOCATION_ID;


    // Verificar valores únicos de property_type
    const { data: propertyTypes, error: propertyTypesError } = await supabase
      .from('listing')
      .select('property_type')
      .eq('agency_id', agencyId)
      .not('property_type', 'is', null);

    if (propertyTypesError) {
      console.error("Property types error:", propertyTypesError);
      return NextResponse.json({ error: "Property types query failed" }, { status: 500 });
    }

    // Extrair valores únicos
    const uniquePropertyTypes = [...new Set(propertyTypes?.map(p => p.property_type) || [])];
    

    // Verificar alguns listings com property_type
    const { data: sampleListings, error: sampleError } = await supabase
      .from('listing')
      .select('listing_id, title, property_type, transaction_type')
      .eq('agency_id', agencyId)
      .not('property_type', 'is', null)
      .limit(10);

    if (sampleError) {
      console.error("Sample listings error:", sampleError);
    }

    // Verificar a materialized view listing_search
    const { data: searchViewData, error: searchError } = await supabase
      .from('listing_search')
      .select('property_type')
      .eq('agency_id', agencyId)
      .not('property_type', 'is', null)
      .limit(10);

    if (searchError) {
      console.error("Search view error:", searchError);
    }

    const uniqueSearchPropertyTypes = [...new Set(searchViewData?.map(p => p.property_type) || [])];

    const result = {
      agency_id: agencyId,
      unique_property_types_from_listing: uniquePropertyTypes,
      unique_property_types_from_search_view: uniqueSearchPropertyTypes,
      sample_listings: sampleListings || [],
      total_listings_with_property_type: propertyTypes?.length || 0
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
