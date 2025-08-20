import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../../lib/supabaseAgent";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: apartmentListings, error: listingsError } = await supabaseAgent
      .from("listing")
      .select("listing_id")
      .eq("condominium_id", id)
      .eq("property_type", "apartment");

    if (listingsError || !apartmentListings || apartmentListings.length === 0) {
      return NextResponse.json({
        min_bedrooms: 0,
        max_bedrooms: 0,
        min_suites: 0,
        max_suites: 0,
        avg_condo_fee: 0,
        avg_iptu: 0,
        total_apartments: 0
      });
    }

    const listingIds = apartmentListings.map(l => l.listing_id);

    const { data: detailsList } = await supabaseAgent
      .from("listing_details")
      .select("bedroom_count, suite_count, property_administration_fee_amount, iptu_amount")
      .in("listing_id", listingIds);

    if (!detailsList || detailsList.length === 0) {
      return NextResponse.json({
        min_bedrooms: 0,
        max_bedrooms: 0,
        min_suites: 0,
        max_suites: 0,
        avg_condo_fee: 0,
        avg_iptu: 0,
        total_apartments: apartmentListings.length
      });
    }

    const bedrooms = detailsList.map(d => d.bedroom_count).filter(b => b !== null && b !== undefined);
    const suites = detailsList.map(d => d.suite_count).filter(s => s !== null && s !== undefined);
    const condoFees = detailsList.map(d => d.property_administration_fee_amount).filter(f => f !== null && f !== undefined);
    const iptus = detailsList.map(d => d.iptu_amount).filter(i => i !== null && i !== undefined);

    const stats = {
      min_bedrooms: bedrooms.length > 0 ? Math.min(...bedrooms) : 0,
      max_bedrooms: bedrooms.length > 0 ? Math.max(...bedrooms) : 0,
      min_suites: suites.length > 0 ? Math.min(...suites) : 0,
      max_suites: suites.length > 0 ? Math.max(...suites) : 0,
      avg_condo_fee: condoFees.length > 0 ? Math.round(condoFees.reduce((a, b) => a + b, 0) / condoFees.length) : 0,
      avg_iptu: iptus.length > 0 ? Math.round(iptus.reduce((a, b) => a + b, 0) / iptus.length) : 0,
      total_apartments: apartmentListings.length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching condominium stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
