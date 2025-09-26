import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../../lib/supabaseAgent";

interface ListingRecord {
  listing_id: string;
}

interface ListingDetailsRecord {
  bedroom_count: number | null;
  suite_count: number | null;
  property_administration_fee_amount: number | null;
  iptu_amount: number | null;
}

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
      .eq("property_type", "apartment") as { data: ListingRecord[] | null; error: unknown };

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

    const listingIds = apartmentListings.map((l: ListingRecord) => l.listing_id);

    const { data: detailsList } = await supabaseAgent
      .from("listing_details")
      .select("bedroom_count, suite_count, property_administration_fee_amount, iptu_amount")
      .in("listing_id", listingIds) as { data: ListingDetailsRecord[] | null; error: unknown };

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

    const bedrooms = detailsList.map((d: ListingDetailsRecord) => d.bedroom_count).filter((b: number | null) => b !== null && b !== undefined) as number[];
    const suites = detailsList.map((d: ListingDetailsRecord) => d.suite_count).filter((s: number | null) => s !== null && s !== undefined) as number[];
    const condoFees = detailsList.map((d: ListingDetailsRecord) => d.property_administration_fee_amount).filter((f: number | null) => f !== null && f !== undefined) as number[];
    const iptus = detailsList.map((d: ListingDetailsRecord) => d.iptu_amount).filter((i: number | null) => i !== null && i !== undefined) as number[];

    const stats = {
      min_bedrooms: bedrooms.length > 0 ? Math.min(...bedrooms) : 0,
      max_bedrooms: bedrooms.length > 0 ? Math.max(...bedrooms) : 0,
      min_suites: suites.length > 0 ? Math.min(...suites) : 0,
      max_suites: suites.length > 0 ? Math.max(...suites) : 0,
      avg_condo_fee: condoFees.length > 0 ? Math.round(condoFees.reduce((a: number, b: number) => a + b, 0) / condoFees.length) : 0,
      avg_iptu: iptus.length > 0 ? Math.round(iptus.reduce((a: number, b: number) => a + b, 0) / iptus.length) : 0,
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

