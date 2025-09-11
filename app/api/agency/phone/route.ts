import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      console.error("LOCATION_ID not configured");
      return NextResponse.json({ 
        error: "LOCATION_ID not configured"
      }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json({ 
        error: "Supabase environment variables not configured"
      }, { status: 500 });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // Tentar a query direta primeiro
    const { data: directQuery, error: directError } = await supabase
      .from('agency_config')
      .select('telephone')
      .eq('agency_id', agencyId)
      .single();

    if (!directError && directQuery) {
      return NextResponse.json({ phone: directQuery.telephone });
    }

    // Se a query direta falhou, tentar sem .single()
    const { data: multipleQuery, error: multipleError } = await supabase
      .from('agency_config')
      .select('*')
      .eq('agency_id', agencyId);

    if (!multipleError && multipleQuery && multipleQuery.length > 0) {
      return NextResponse.json({ phone: multipleQuery[0].telephone });
    }

    // Se ainda não funcionou, tentar função SQL personalizada
    const { data: functionResult, error: functionError } = await supabase
      .rpc('get_agency_phone', { target_agency_id: agencyId });

    if (!functionError && functionResult) {
      return NextResponse.json({ phone: functionResult });
    }

    // Se nenhuma abordagem funcionou, retornar erro
    console.error("No agency configuration found for agency_id:", agencyId);
    return NextResponse.json({ 
      error: "Agency configuration not found"
    }, { status: 404 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 });
  }
}
