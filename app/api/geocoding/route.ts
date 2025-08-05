import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const zoom = searchParams.get("zoom") || "10";

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude e longitude são obrigatórios" }, { status: 400 });
    }

    const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}`;
    
    const response = await fetch(geocodingUrl, {
      headers: {
        'User-Agent': 'RealEstatePortal/1.0'
      }
    });

    if (!response.ok) {
      console.error("Erro na API de geocoding:", response.status, response.statusText);
      return NextResponse.json({ error: "Erro ao obter dados de geocoding" }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Erro na API de geocoding:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 