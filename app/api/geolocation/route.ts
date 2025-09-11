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
        country: "BR",
        lat: -20.2976,
        lng: -40.2958
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
          country: "BR",
          lat: -20.2976,
          lng: -40.2958
        });
      }

      const cityMapping: Record<string, { city_id: number; state_id: number; lat: number; lng: number }> = {
        "Vitória": { city_id: 3205309, state_id: 32, lat: -20.2976, lng: -40.2958 },
        "Vila Velha": { city_id: 3205200, state_id: 32, lat: -20.3297, lng: -40.2925 },
        "Serra": { city_id: 3205002, state_id: 32, lat: -20.1286, lng: -40.3078 },
        "Cariacica": { city_id: 3201308, state_id: 32, lat: -20.2639, lng: -40.4169 },
        "Belo Horizonte": { city_id: 3106200, state_id: 31, lat: -19.9167, lng: -43.9345 },
        "São Paulo": { city_id: 3550308, state_id: 35, lat: -23.5505, lng: -46.6333 },
        "Rio de Janeiro": { city_id: 3304557, state_id: 33, lat: -22.9068, lng: -43.1729 }
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
          country: "BR",
          lat: -20.2976,
          lng: -40.2958
        });
      }

      const cityInfo = cityMapping[cityName];
      
      if (cityInfo) {
        return NextResponse.json({
          city: cityName,
          state: stateName,
          city_id: cityInfo.city_id,
          state_id: cityInfo.state_id,
          country: "BR",
          lat: cityInfo.lat,
          lng: cityInfo.lng
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
          country: "BR",
          lat: -20.2976,
          lng: -40.2958
        });
      }

      return NextResponse.json({
        city: "Vitória",
        state: "ES",
        city_id: 3205309,
        state_id: 32,
        country: "BR",
        lat: -20.2976,
        lng: -40.2958
      });

    } catch (apiError) {
      console.error("Error calling IP-API:", apiError);
      return NextResponse.json({
        city: "Vitória",
        state: "ES",
        city_id: 3205309,
        state_id: 32,
        country: "BR",
        lat: -20.2976,
        lng: -40.2958
      });
    }

  } catch (error) {
    console.error("Geolocation API error:", error);
    return NextResponse.json({
      city: "Vitória",
      state: "ES",
      city_id: 3205309,
      state_id: 32,
      country: "BR",
      lat: -20.2976,
      lng: -40.2958
    });
  }
}
