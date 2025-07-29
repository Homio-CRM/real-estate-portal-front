import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../lib/supabaseAgent";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ error: "Nome da cidade é obrigatório" }, { status: 400 });
    }

    const { data: cities, error } = await supabaseAgent
      .from("city")
      .select("city_id, city_name, state_name")
      .ilike("city_name", `%${name}%`)
      .limit(5);

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