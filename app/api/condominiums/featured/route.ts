import { NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";
import { Database } from "../../../../types/database";
import type { MediaItem } from "../../../../types/listings";

type LaunchSearchRow = Database["public"]["Views"]["launch_search"]["Row"];
type EntityLocationRow = Database["public"]["Tables"]["entity_location"]["Row"];
type EntityFeaturesRow = Database["public"]["Tables"]["entity_features"]["Row"];
type MediaItemRow = Database["public"]["Tables"]["media_item"]["Row"];

type ParsedLocation = Partial<EntityLocationRow>;
type ParsedFeatures = Partial<EntityFeaturesRow> & {
  primary_media_url?: string | null;
  media?: Array<{ url?: string | null } | null>;
};
type ParsedMediaItems = Array<Partial<MediaItemRow>>;

const PLACEHOLDER_IMAGE = "/placeholder-property.jpg";

const AD_TYPE_PRIORITY = [
  ["superPremium"],
  ["premium"],
  ["standard"],
] as const;

function formatPrice(minPrice?: number | null, maxPrice?: number | null): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  }
  if (minPrice) {
    return `A partir de ${formatCurrency(minPrice)}`;
  }
  return "Preço sob consulta";
}

function formatArea(minArea?: number | null, maxArea?: number | null): string {
  if (minArea && maxArea && minArea !== maxArea) {
    return `${minArea} - ${maxArea} m²`;
  }
  if (minArea) {
    return `A partir de ${minArea} m²`;
  }
  return "Área sob consulta";
}

function getCityName(cityId?: number | null): string {
  const cities: Record<number, string> = {
    3205309: "Vitória - ES",
    3205200: "Vila Velha - ES",
    3205002: "Serra - ES",
    3201308: "Cariacica - ES",
    3106200: "Belo Horizonte - MG",
  };
  return cities[cityId || 0] || "Cidade não identificada";
}

function parseJson<T>(value: unknown): T | null {
  if (!value) {
    return null;
  }
  if (typeof value === "object") {
    return value as T;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function buildCard(item: LaunchSearchRow) {
  if (!item.id) {
    return null;
  }

  const locationData = parseJson<ParsedLocation>(item.location);
  const featuresData = parseJson<ParsedFeatures>(item.features);
  const mediaItemsData = parseJson<ParsedMediaItems>(item.media_items);
  const minPrice = typeof item.min_price === "number" ? item.min_price : null;
  const maxPrice = typeof item.max_price === "number" ? item.max_price : null;
  const minArea = typeof item.min_area === "number" ? item.min_area : null;
  const maxArea = typeof item.max_area === "number" ? item.max_area : null;
  const countryCode = locationData?.country_code || "";
  const stateId = typeof locationData?.state_id === "number" ? locationData.state_id : null;
  const cityId = typeof locationData?.city_id === "number" ? locationData.city_id : null;
  const cityName = cityId ? getCityName(cityId) : undefined;
  const displayAddress =
    locationData?.display_address ||
    (locationData?.neighborhood && cityName
      ? `${locationData.neighborhood}, ${cityName}`
      : cityName || "Localização não informada");

  const imageFromFeatures = (() => {
    if (featuresData?.primary_media_url && typeof featuresData.primary_media_url === "string") {
      return featuresData.primary_media_url;
    }
    if (Array.isArray(featuresData?.media)) {
      const mediaItem = featuresData.media.find((media) => media && typeof media.url === "string");
      if (mediaItem && typeof mediaItem.url === "string") {
        return mediaItem.url;
      }
    }
    return null;
  })();
  const mediaItems = (() => {
    if (!Array.isArray(mediaItemsData)) {
      return [] as MediaItem[];
    }
    const sorted = mediaItemsData
      .filter(
        (media): media is Partial<MediaItemRow> &
          Pick<MediaItemRow, "url"> & { is_primary?: boolean | null; order?: number | null } =>
          !!media && typeof media.url === "string"
      )
      .sort((a, b) => {
        const aPrimary = a.is_primary ? 1 : 0;
        const bPrimary = b.is_primary ? 1 : 0;
        if (aPrimary !== bPrimary) {
          return bPrimary - aPrimary;
        }
        const aOrder = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return 0;
      });
    return sorted.map((media, index) => ({
      id: media.id ?? `${item.id ?? "launch"}-${index}`,
      entity_type: media.entity_type ?? "condominium",
      condominium_id: media.condominium_id ?? item.id ?? undefined,
      listing_id: media.listing_id ?? undefined,
      medium: media.medium ?? "image",
      caption: media.caption ?? null,
      is_primary: Boolean(media.is_primary),
      order: typeof media.order === "number" ? media.order : index,
      url: media.url,
    })) as MediaItem[];
  })();
  const imageFromMediaList = mediaItems.length > 0 ? mediaItems[0].url : null;
  const image = imageFromMediaList || imageFromFeatures || PLACEHOLDER_IMAGE;

  return {
    id: item.id,
    name: item.name || "Empreendimento",
    agency_id: item.agency_id || "",
    condominium_id: item.id,
    is_launch: item.is_launch ?? true,
    min_price: minPrice,
    max_price: maxPrice,
    min_area: minArea,
    max_area: maxArea,
    year_built: item.year_built,
    total_units: (item as LaunchSearchRow & { total_units?: number | null }).total_units ?? item.available_units ?? null,
    description: item.description,
    usage_type: item.usage_type,
    display_address: displayAddress,
    neighborhood: locationData?.neighborhood || null,
    address: locationData?.address || null,
    street_number: locationData?.street_number || null,
    postal_code: locationData?.postal_code || null,
    latitude: typeof locationData?.latitude === "number" ? locationData.latitude : null,
    longitude: typeof locationData?.longitude === "number" ? locationData.longitude : null,
    city_id: cityId,
    state_id: stateId,
    country_code: countryCode,
    zone: locationData?.zone || null,
    image,
    price: formatPrice(minPrice, maxPrice),
    area_range: formatArea(minArea, maxArea),
    media_count: mediaItems.length > 0
      ? mediaItems.length
      : typeof item.media_count === "number"
        ? item.media_count
        : 0,
    media: mediaItems,
    features: featuresData && typeof featuresData === "object" ? featuresData : {},
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityIdParam = searchParams.get("cityId");
  const limit = Math.max(1, Number(searchParams.get("limit") || 6));
  const offset = Math.max(0, Number(searchParams.get("offset") || 0));
  const strictCityFilter = searchParams.get("strictCityFilter") === "true";

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
  }

  const agencyId = process.env.LOCATION_ID;
  const cityIdNumber = cityIdParam ? Number(cityIdParam) : undefined;
  const hasValidCity = typeof cityIdNumber === "number" && !Number.isNaN(cityIdNumber);
  const totalNeeded = offset + limit;
  const results: NonNullable<ReturnType<typeof buildCard>>[] = [];
  const processedIds = new Set<string>();
  const maxAttempts = (hasValidCity && !strictCityFilter) ? 2 : 1;
  let attempt = 0;
  let useCityFilter = hasValidCity;

  while (results.length < totalNeeded && attempt < maxAttempts) {
    for (const adTypes of AD_TYPE_PRIORITY) {
      if (results.length >= totalNeeded) {
        break;
      }

      let query = supabaseAgent
        .from("launch_search")
        .select("*")
        .eq("is_launch", true)
        .in("ad_type", adTypes)
        .not("name", "ilike", "%trevas%");

      if (agencyId) {
        query = query.eq("agency_id", agencyId);
      }

      if (useCityFilter && hasValidCity && cityIdNumber !== undefined) {
        query = query.contains("location", { city_id: cityIdNumber });
      }

      const remaining = totalNeeded - results.length;
      const { data, error } = await query
        .order("max_price", { ascending: false, nullsFirst: false })
        .limit(Math.max(remaining, limit) * 2);

      if (error) {
        return NextResponse.json({ error: "Erro ao buscar lançamentos" }, { status: 500 });
      }

      const rows = (data ?? []) as LaunchSearchRow[];

      for (const item of rows) {
        if (!item?.id || processedIds.has(item.id)) {
          continue;
        }

        const card = buildCard(item);
        if (!card) {
          continue;
        }

        processedIds.add(item.id);
        results.push(card);

        if (results.length >= totalNeeded) {
          break;
        }
      }
    }

    attempt += 1;
    useCityFilter = false;
  }

  if (results.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json(results.slice(offset, offset + limit));
}
