import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const cityId = searchParams.get("id");

  if (!query && !cityId) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    if (cityId) {
      const { data, error } = await supabaseAgent
        .from("city")
        .select("id, name")
        .eq("id", cityId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      const { data, error } = await supabaseAgent
        .from("city")
        .select("id, name")
        .ilike("name", `${query}%`)
        .order("name")
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 