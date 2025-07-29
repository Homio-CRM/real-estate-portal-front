import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("SUPABASE_URL:", !!supabaseUrl);
  console.error("SUPABASE_ANON_KEY:", !!anonKey);
  throw new Error("Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required");
}

const createSupabaseAgent = () => {
  try {
    const client = createClient(supabaseUrl, anonKey);
    console.log("Supabase client created successfully");
    return client;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
};

export const supabaseAgent = createSupabaseAgent(); 