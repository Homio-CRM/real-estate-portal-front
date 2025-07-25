import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";
import { ListingLocationResponse, ListingResponse, ListingDetailsResponse } from "../../../types/api";

export async function GET(req: NextRequest) {
  const agencyId = process.env.LOCATION_ID!;
  const { searchParams } = new URL(req.url);
  const transactionType = searchParams.get("transactionType");
  const cityId = searchParams.get("cityId");
  const limit = Number(searchParams.get("limit") || 30);
  const offset = Number(searchParams.get("offset") || 0);

  if (!transactionType || !cityId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const { data: locations, error: locError } = await supabaseAgent
    .from("listing_location")
    .select("listing_id")
    .eq("city_id", Number(cityId));
  if (locError) {
    return NextResponse.json({ error: locError.message }, { status: 500 });
  }
  const listingIds = (locations || []).map((loc: ListingLocationResponse) => loc.listing_id);
  if (listingIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: listings, error } = await supabaseAgent
    .from("listing")
    .select("*")
    .eq("transaction_type", transactionType)
    .eq("agency_id", agencyId)
    .in("listing_id", listingIds)
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: details, error: detailsError } = await supabaseAgent
    .from("listing_details")
    .select("*")
    .in("listing_id", (listings || []).map((l: ListingResponse) => l.listing_id));
  if (detailsError) {
    return NextResponse.json({ error: detailsError.message }, { status: 500 });
  }

  const results = (listings || []).map((listing: ListingResponse) => {
    const detail = (details || []).find((d: ListingDetailsResponse) => d.listing_id === listing.listing_id);
    return { ...listing, ...detail };
  });

  return NextResponse.json(results);
}
