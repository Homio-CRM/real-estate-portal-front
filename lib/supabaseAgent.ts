import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

// Define types for the mock client to match Supabase client interface
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface MockQueryBuilder {
  eq: (column: string, value: unknown) => MockQueryBuilder;
  not: (column: string, operator: string, value: unknown) => MockQueryBuilder;
  ilike: (column: string, pattern: string) => MockQueryBuilder;
  in: (column: string, values: unknown[]) => MockQueryBuilder;
  limit: (count: number) => Promise<SupabaseResponse<unknown[]>>;
  range: (start: number, end: number) => Promise<SupabaseResponse<unknown[]>>;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder;
  single: () => Promise<SupabaseResponse<unknown>>;
  then: (onfulfilled?: (value: SupabaseResponse<unknown[]>) => unknown, onrejected?: (reason: unknown) => unknown) => Promise<unknown>;
}

interface MockSupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => MockQueryBuilder;
    insert: (data: unknown | unknown[]) => Promise<SupabaseResponse<unknown>>;
  };
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<SupabaseResponse<unknown>>;
}

console.log('🔧 SupabaseAgent: Verificando variáveis de ambiente...');
console.log('🔧 SupabaseAgent: SUPABASE_URL existe:', !!supabaseUrl);
console.log('🔧 SupabaseAgent: SUPABASE_ANON_KEY existe:', !!anonKey);

// Criar um cliente mock que sempre retorna erro controlado
const createMockQueryBuilder = (): MockQueryBuilder => {
  const mockResponse = { 
    data: [], 
    error: { message: "Supabase not configured" } 
  };
  
  const mockSingleResponse = { 
    data: null, 
    error: { message: "Supabase not configured" } 
  };

  return {
    eq: () => createMockQueryBuilder(),
    not: () => createMockQueryBuilder(),
    ilike: () => createMockQueryBuilder(),
    in: () => createMockQueryBuilder(),
    order: () => createMockQueryBuilder(),
    limit: () => Promise.resolve(mockResponse),
    range: () => Promise.resolve(mockResponse),
    single: () => Promise.resolve(mockSingleResponse),
    then: (onfulfilled, onrejected) => Promise.resolve(mockResponse).then(onfulfilled, onrejected)
  };
};

const createMockClient = (): MockSupabaseClient => ({
  from: () => ({
    select: () => createMockQueryBuilder(),
    insert: () => Promise.resolve({ 
      data: null, 
      error: { message: "Supabase not configured" } 
    })
  }),
  rpc: () => Promise.resolve({ 
    data: null, 
    error: { message: "Supabase not configured" } 
  })
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseAgent: any;

if (!supabaseUrl || !anonKey) {
  console.error('❌ SupabaseAgent: Variáveis de ambiente ausentes!');
  console.error('❌ SupabaseAgent: SUPABASE_URL:', supabaseUrl);
  console.error('❌ SupabaseAgent: SUPABASE_ANON_KEY:', anonKey ? 'DEFINIDA' : 'AUSENTE');
  console.log('⚠️ SupabaseAgent: Usando cliente mock devido a variáveis ausentes');
  
  supabaseAgent = createMockClient();
} else {
  console.log('✅ SupabaseAgent: Variáveis encontradas, criando cliente real...');
  
  const createSupabaseAgent = (): SupabaseClient | MockSupabaseClient => {
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