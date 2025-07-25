import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createSupabaseAgent = () => {
  const payload = {
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  };
  const token = jwt.sign(payload, serviceRoleKey, { algorithm: "HS256" });

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export const supabaseAgent = createSupabaseAgent(); 