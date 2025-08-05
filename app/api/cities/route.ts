import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const stateId = searchParams.get("stateId");

    if (!name) {
      return NextResponse.json({ error: "Nome da cidade é obrigatório" }, { status: 400 });
    }

    let query = supabaseAgent
      .from("city")
      .select("id, name, state_id")
      .ilike("name", `%${name}%`);

    if (stateId) {
      query = query.eq("state_id", Number(stateId));
    }

    const { data: cities, error } = await query.limit(5);

    if (error) {
      console.error("Erro ao buscar cidades:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(cities || []);
  } catch (error) {
    console.error("Erro na API de cidades:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}