import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 SupabaseAgent: Verificando variáveis de ambiente...');
console.log('🔧 SupabaseAgent: SUPABASE_URL existe:', !!supabaseUrl);
console.log('🔧 SupabaseAgent: SUPABASE_ANON_KEY existe:', !!anonKey);

// Criar um cliente mock que sempre retorna erro controlado
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } })
      }),
      not: () => ({
        limit: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } })
      }),
      ilike: () => ({
        limit: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } })
      }),
      in: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } })
    })
  })
});

let supabaseAgent;

if (!supabaseUrl || !anonKey) {
  console.error('❌ SupabaseAgent: Variáveis de ambiente ausentes!');
  console.error('❌ SupabaseAgent: SUPABASE_URL:', supabaseUrl);
  console.error('❌ SupabaseAgent: SUPABASE_ANON_KEY:', anonKey ? 'DEFINIDA' : 'AUSENTE');
  console.log('⚠️ SupabaseAgent: Usando cliente mock devido a variáveis ausentes');
  
  supabaseAgent = createMockClient();
} else {
  console.log('✅ SupabaseAgent: Variáveis encontradas, criando cliente real...');
  
  const createSupabaseAgent = () => {
    try {
      const client = createClient(supabaseUrl, anonKey);
      console.log('✅ SupabaseAgent: Cliente criado com sucesso');
      return client;
    } catch (error) {
      console.error("💥 SupabaseAgent: Erro ao criar cliente:", error);
      console.log('⚠️ SupabaseAgent: Voltando para cliente mock devido ao erro');
      return createMockClient();
    }
  };

  supabaseAgent = createSupabaseAgent();
}

export { supabaseAgent }; 