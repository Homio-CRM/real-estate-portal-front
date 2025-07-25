import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;



const createSupabaseAgent = () => {
  return createClient(supabaseUrl, anonKey);
};

export const supabaseAgent = createSupabaseAgent(); 