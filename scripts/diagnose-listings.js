const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const agencyId = process.env.LOCATION_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

if (!agencyId) {
  console.error('❌ Variável de ambiente LOCATION_ID é obrigatória');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseListings() {
  console.log('🔍 Diagnóstico de Listings\n');
  console.log(`📍 Agency ID configurado: ${agencyId}\n`);

  try {
    const { data: allListings, error: allError } = await supabase
      .from('listing_search')
      .select('listing_id, agency_id, transaction_type, ad_type, city_id, property_type')
      .limit(200);

    if (allError) {
      console.error('❌ Erro ao buscar listings:', allError);
      return;
    }

    console.log(`📊 Total de imóveis na view listing_search: ${allListings?.length || 0}\n`);

    if (!allListings || allListings.length === 0) {
      console.log('⚠️  Nenhum imóvel encontrado na view listing_search');
      console.log('   Verifique se a view está configurada corretamente no banco de dados\n');
      return;
    }

    const withAgencyId = allListings.filter(l => l.agency_id === agencyId);
    const withoutAgencyId = allListings.filter(l => l.agency_id !== agencyId);
    const nullAgencyId = allListings.filter(l => !l.agency_id);

    console.log(`✅ Com agency_id correto (${agencyId}): ${withAgencyId.length}`);
    console.log(`❌ Com agency_id diferente: ${withoutAgencyId.length}`);
    console.log(`⚠️  Com agency_id NULL: ${nullAgencyId.length}\n`);

    const validAdTypes = ['standard', 'premium', 'superPremium', 'premiere1', 'premiere2', 'triple', 'paused', 'inactive'];
    const withValidAdType = withAgencyId.filter(l => validAdTypes.includes(l.ad_type));
    const withInvalidAdType = withAgencyId.filter(l => l.ad_type && !validAdTypes.includes(l.ad_type));
    const nullAdType = withAgencyId.filter(l => !l.ad_type);

    console.log(`✅ Com ad_type válido: ${withValidAdType.length}`);
    console.log(`❌ Com ad_type inválido: ${withInvalidAdType.length}`);
    if (withInvalidAdType.length > 0) {
      const invalidTypes = [...new Set(withInvalidAdType.map(l => l.ad_type))];
      console.log(`   Tipos inválidos encontrados: ${invalidTypes.join(', ')}`);
    }
    console.log(`⚠️  Com ad_type NULL: ${nullAdType.length}\n`);

    const withTransactionType = withValidAdType.filter(l => l.transaction_type === 'rent' || l.transaction_type === 'sale');
    const withoutTransactionType = withValidAdType.filter(l => l.transaction_type !== 'rent' && l.transaction_type !== 'sale');
    const nullTransactionType = withValidAdType.filter(l => !l.transaction_type);

    console.log(`✅ Com transaction_type válido (rent/sale): ${withTransactionType.length}`);
    console.log(`❌ Com transaction_type inválido: ${withoutTransactionType.length}`);
    if (withoutTransactionType.length > 0) {
      const invalidTypes = [...new Set(withoutTransactionType.map(l => l.transaction_type))];
      console.log(`   Tipos inválidos encontrados: ${invalidTypes.join(', ')}`);
    }
    console.log(`⚠️  Com transaction_type NULL: ${nullTransactionType.length}\n`);

    const withListingId = withTransactionType.filter(l => l.listing_id);
    const nullListingId = withTransactionType.filter(l => !l.listing_id);

    console.log(`✅ Com listing_id preenchido: ${withListingId.length}`);
    console.log(`⚠️  Com listing_id NULL: ${nullListingId.length}\n`);

    const withCityId = withListingId.filter(l => l.city_id);
    const nullCityId = withListingId.filter(l => !l.city_id);

    console.log(`✅ Com city_id preenchido: ${withCityId.length}`);
    console.log(`⚠️  Com city_id NULL: ${nullCityId.length}\n`);

    console.log('📋 Resumo dos imóveis que DEVEM aparecer:');
    console.log(`   Total: ${withCityId.length} imóveis\n`);

    if (withCityId.length === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: Nenhum imóvel atende todos os critérios!\n');
      console.log('🔧 Ações recomendadas:');
      
      if (withAgencyId.length === 0) {
        console.log('   1. Verifique se o agency_id dos imóveis corresponde ao LOCATION_ID');
        console.log(`      LOCATION_ID atual: ${agencyId}`);
        if (allListings.length > 0) {
          const uniqueAgencyIds = [...new Set(allListings.map(l => l.agency_id).filter(Boolean))];
          console.log(`      Agency IDs encontrados: ${uniqueAgencyIds.join(', ')}`);
        }
      }
      
      if (withValidAdType.length === 0 && withAgencyId.length > 0) {
        console.log('   2. Verifique se os imóveis têm ad_type válido');
        console.log(`      Tipos válidos: ${validAdTypes.join(', ')}`);
      }
      
      if (withTransactionType.length === 0 && withValidAdType.length > 0) {
        console.log('   3. Verifique se os imóveis têm transaction_type = "rent" ou "sale"');
      }
      
      if (withListingId.length === 0 && withTransactionType.length > 0) {
        console.log('   4. Verifique se os imóveis têm listing_id preenchido');
      }
      
      if (withCityId.length === 0 && withListingId.length > 0) {
        console.log('   5. Verifique se os imóveis têm city_id preenchido');
      }
    } else {
      console.log('✅ Imóveis encontrados que devem aparecer no portal!');
      console.log('   Se ainda não aparecem, verifique:');
      console.log('   - Se a busca está sendo feita com os filtros corretos (cityId, transactionType)');
      console.log('   - Se há filtros adicionais sendo aplicados no frontend');
    }

    console.log('\n📊 Distribuição por transaction_type:');
    const saleCount = withCityId.filter(l => l.transaction_type === 'sale').length;
    const rentCount = withCityId.filter(l => l.transaction_type === 'rent').length;
    console.log(`   Venda (sale): ${saleCount}`);
    console.log(`   Aluguel (rent): ${rentCount}\n`);

    console.log('📊 Distribuição por ad_type:');
    const adTypeCounts = {};
    withCityId.forEach(l => {
      adTypeCounts[l.ad_type] = (adTypeCounts[l.ad_type] || 0) + 1;
    });
    Object.entries(adTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

diagnoseListings();



