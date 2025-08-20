import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";

// Dados específicos para Vitória
const vitoriaCondominiums = [
  {
    name: 'Residencial Vista do Convento',
    city_id: 3205309,
    neighborhood: 'Centro',
    address: 'Rua Duque de Caxias',
    min_price: 450000,
    max_price: 780000,
    min_area: 65,
    max_area: 120,
    year_built: 2024,
    total_units: 124,
    latitude: -20.3155,
    longitude: -40.3128,
    description: 'Exclusivo condomínio com vista panorâmica para a baía de Vitória. Localizado no coração do Centro Histórico.',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'
  },
  {
    name: 'Condomínio Ilha do Frade Premium',
    city_id: 3205309,
    neighborhood: 'Ilha do Frade',
    address: 'Avenida Ilha do Frade',
    min_price: 380000,
    max_price: 650000,
    min_area: 58,
    max_area: 95,
    year_built: 2024,
    total_units: 88,
    latitude: -20.2845,
    longitude: -40.2756,
    description: 'Lançamento premium na Ilha do Frade com acesso privativo à praia.',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
  },
  {
    name: 'Edifício Vitória Bay',
    city_id: 3205309,
    neighborhood: 'Centro',
    address: 'Avenida Jerônimo Monteiro',
    min_price: 520000,
    max_price: 920000,
    min_area: 72,
    max_area: 140,
    year_built: 2025,
    total_units: 156,
    latitude: -20.3190,
    longitude: -40.3376,
    description: 'Moderno edifício na região central com fácil acesso a shoppings.',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
  },
  {
    name: 'Residencial Praia do Canto Tower',
    city_id: 3205309,
    neighborhood: 'Praia do Canto',
    address: 'Rua Joaquim Lírio',
    min_price: 680000,
    max_price: 1200000,
    min_area: 85,
    max_area: 180,
    year_built: 2024,
    total_units: 240,
    latitude: -20.2995,
    longitude: -40.2878,
    description: 'Torres residenciais na nobre Praia do Canto com vista para o mar.',
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
  },
  {
    name: 'Vila Residence Enseada do Suá',
    city_id: 3205309,
    neighborhood: 'Enseada do Suá',
    address: 'Rua Santos Dumont',
    min_price: 890000,
    max_price: 1500000,
    min_area: 95,
    max_area: 220,
    year_built: 2025,
    total_units: 64,
    latitude: -20.3045,
    longitude: -40.2934,
    description: 'Residencial exclusivo na Enseada do Suá, uma das regiões mais valorizadas.',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
  },
  {
    name: 'Condomínio Mata da Praia Life',
    city_id: 3205309,
    neighborhood: 'Mata da Praia',
    address: 'Avenida Mata da Praia',
    min_price: 560000,
    max_price: 850000,
    min_area: 78,
    max_area: 150,
    year_built: 2024,
    total_units: 112,
    latitude: -20.2922,
    longitude: -40.2845,
    description: 'Condomínio moderno com conceito de vida saudável e áreas verdes.',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
  }
];

export async function POST(request: NextRequest) {
  console.log("=== INSERT VITORIA CONDOS API ===");
  
  try {
    const agencyId = process.env.LOCATION_ID;
    
    if (!agencyId) {
      return NextResponse.json({ error: "Agency ID not configured" }, { status: 500 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const condo of vitoriaCondominiums) {
      try {
        console.log(`Creating: ${condo.name} in ${condo.neighborhood}...`);
        
        // Gerar UUID para o condomínio
        const condoId = crypto.randomUUID();
        
        // 1. Inserir na tabela condominium
        const { error: condoError } = await supabaseAgent
          .from('condominium')
          .insert({
            id: condoId,
            name: condo.name,
            agency_id: agencyId,
            is_launch: true,
            min_price: condo.min_price,
            max_price: condo.max_price,
            min_area: condo.min_area,
            max_area: condo.max_area,
            year_built: condo.year_built,
            total_units: condo.total_units,
            description: condo.description,
            usage_type: 'residential'
          });
        
        if (condoError) {
          console.error(`Error inserting condo ${condo.name}:`, condoError);
          errorCount++;
          results.push({ name: condo.name, status: 'error', error: condoError.message });
          continue;
        }
        
        // 2. Inserir localização
        const { error: locationError } = await supabaseAgent
          .from('entity_location')
          .insert({
            entity_type: 'condominium',
            condominium_id: condoId,
            city_id: condo.city_id,
            state_id: 32, // Espírito Santo
            neighborhood: condo.neighborhood,
            address: condo.address,
            display_address: `${condo.neighborhood}, Vitória - ES`,
            latitude: condo.latitude,
            longitude: condo.longitude,
            country_code: 'BR',
            postal_code: '29000-000'
          });
        
        if (locationError) {
          console.error(`Error inserting location for ${condo.name}:`, locationError);
          errorCount++;
          results.push({ name: condo.name, status: 'error', error: locationError.message });
          continue;
        }
        
        // 3. Inserir mídia
        const { error: mediaError } = await supabaseAgent
          .from('media_item')
          .insert({
            id: crypto.randomUUID(),
            listing_id: null,
            condominium_id: condoId,
            entity_type: 'condominium',
            medium: 'image',
            caption: `Fachada do ${condo.name}`,
            is_primary: true,
            url: condo.image_url,
            order: 1
          });
        
        if (mediaError) {
          console.error(`Error inserting media for ${condo.name}:`, mediaError);
          // Continue anyway - location and condo were created successfully
        }
        
        // 4. Inserir features básicas
        const { error: featuresError } = await supabaseAgent
          .from('entity_features')
          .insert({
            entity_type: 'condominium',
            condominium_id: condoId,
            pool: true,
            gym: true,
            barbecue_area: true,
            pet_area: true,
            elevator: condo.min_price > 500000 // Elevador para condomínios mais caros
          });
        
        if (featuresError) {
          console.error(`Error inserting features for ${condo.name}:`, featuresError);
          // Continue anyway
        }
        
        successCount++;
        results.push({ name: condo.name, status: 'success' });
        console.log(`✅ ${condo.name} created successfully!`);
        
      } catch (error) {
        console.error(`Unexpected error for ${condo.name}:`, error);
        errorCount++;
        results.push({ name: condo.name, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    console.log(`=== SUMMARY: ${successCount} success, ${errorCount} errors ===`);
    
    return NextResponse.json({
      message: `Condomínios de Vitória inseridos`,
      successCount,
      errorCount,
      totalAttempted: vitoriaCondominiums.length,
      results
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
