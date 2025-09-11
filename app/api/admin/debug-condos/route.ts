import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

export async function GET() {
  
  try {
    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      return NextResponse.json({ error: "Agency ID not configured" }, { status: 500 });
    }

    // 1. Verificar condomínios na tabela principal
    const { data: condos, error: condoError } = await supabaseAgent
      .from('condominium')
      .select('*')
      .eq('agency_id', agencyId);

    if (condoError) {
      console.error("Error fetching condominiums:", condoError);
    }

    // 2. Verificar localizações de condomínios
    const { data: locations, error: locationError } = await supabaseAgent
      .from('entity_location')
      .select('*')
      .eq('entity_type', 'condominium');

    if (locationError) {
      console.error("Error fetching locations:", locationError);
    }

    // 3. Verificar mídia de condomínios
    const { data: media, error: mediaError } = await supabaseAgent
      .from('media_item')
      .select('*')
      .eq('entity_type', 'condominium');

    if (mediaError) {
      console.error("Error fetching media:", mediaError);
    }

    // 4. Verificar se existe uma view ou tabela "condominium_search"
    let searchTableExists = false;
    let searchData = null;
    try {
      const { data, error } = await supabaseAgent
        .from('condominium_search')
        .select('*')
        .limit(5);
      
      if (!error) {
        searchTableExists = true;
        searchData = data;
      }
    } catch {
      // Table doesn't exist
    }

    // 5. Listar todas as tabelas disponíveis (se possível)
    const { data: tables, error: tablesError } = await supabaseAgent
      .rpc('get_tables');

    const debugInfo = {
      timestamp: new Date().toISOString(),
      agencyId,
      condominiums: {
        count: condos?.length || 0,
        data: condos?.slice(0, 3) || [], // Primeiros 3 para debug
        error: condoError?.message
      },
      locations: {
        count: locations?.length || 0,
        condominiumLocations: locations?.filter(l => l.entity_type === 'condominium').length || 0,
        data: locations?.filter(l => l.entity_type === 'condominium').slice(0, 3) || [],
        error: locationError?.message
      },
      media: {
        count: media?.length || 0,
        condominiumMedia: media?.filter(m => m.entity_type === 'condominium').length || 0,
        data: media?.filter(m => m.entity_type === 'condominium').slice(0, 3) || [],
        error: mediaError?.message
      },
      searchTable: {
        exists: searchTableExists,
        data: searchData,
      },
      availableTables: tables || "Could not fetch table list",
      tablesError: tablesError?.message
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
