import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const envVars = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      LOCATION_ID: !!process.env.LOCATION_ID,
    };

    return NextResponse.json({
      message: "Environment variables check",
      envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}