import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0] : realIp || "127.0.0.1";
    
    
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return NextResponse.json({
        city: "Vitória",
        state: "ES", 
        city_id: 3205309,
        state_id: 32,
        country: "BR"
      });
    }

    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,region,country,query`, {
        headers: {
          'User-Agent': 'RealEstatePortal/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "fail") {
        return NextResponse.json({
          city: "Vitória",
          state: "ES",
          city_id: 3205309,
          state_id: 32,
          country: "BR"
        });
      }

      const cityMapping: Record<string, { city_id: number; state_id: number }> = {
        "Vitória": { city_id: 3205309, state_id: 32 },
        "Vila Velha": { city_id: 3205200, state_id: 32 },
        "Serra": { city_id: 3205002, state_id: 32 },
        "Cariacica": { city_id: 3201308, state_id: 32 },
        "Belo Horizonte": { city_id: 3106200, state_id: 31 },
        "São Paulo": { city_id: 3550308, state_id: 35 },
        "Rio de Janeiro": { city_id: 3304557, state_id: 33 }
      };

      const cityName = data.city;
      const stateName = data.region;
      const country = data.country;

      if (country !== "Brazil") {
        return NextResponse.json({
          city: "Vitória",
          state: "ES",
          city_id: 3205309,
          state_id: 32,
          country: "BR"
        });
      }

      const cityInfo = cityMapping[cityName];
      
      if (cityInfo) {
        return NextResponse.json({
          city: cityName,
          state: stateName,
          city_id: cityInfo.city_id,
          state_id: cityInfo.state_id,
          country: "BR"
        });
      }

      const stateMapping: Record<string, number> = {
        "Espírito Santo": 32,
        "Minas Gerais": 31,
        "São Paulo": 35,
        "Rio de Janeiro": 33,
        "Bahia": 29,
        "Paraná": 41,
        "Rio Grande do Sul": 43,
        "Pernambuco": 26,
        "Ceará": 23,
        "Pará": 15
      };

      const stateId = stateMapping[stateName];
      
      if (stateId) {
        return NextResponse.json({
          city: cityName,
          state: stateName,
          city_id: null,
          state_id: stateId,
          country: "BR"
        });
      }

      return NextResponse.json({
        city: "Vitória",
        state: "ES",
        city_id: 3205309,
        state_id: 32,
        country: "BR"
      });

    } catch (apiError) {
      console.error("Error calling IP-API:", apiError);
      return NextResponse.json({
        city: "Vitória",
        state: "ES",
        city_id: 3205309,
        state_id: 32,
        country: "BR"
      });
    }

  } catch (error) {
    console.error("Geolocation API error:", error);
    return NextResponse.json({
      city: "Vitória",
      state: "ES",
      city_id: 3205309,
      state_id: 32,
      country: "BR"
    });
  }
}
