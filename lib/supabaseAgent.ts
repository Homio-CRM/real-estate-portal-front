import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required");
}

const createSupabaseAgent = () => {
  try {
    const client = createClient(supabaseUrl, anonKey);
    return client;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
};

export const supabaseAgent = createSupabaseAgent(); 