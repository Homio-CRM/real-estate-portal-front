import { NextRequest, NextResponse } from "next/server";
import { supabaseAgent } from "../../../../lib/supabaseAgent";
import { Tables } from "../../../../types/database";

type EnrichedAddress = {
  street?: string;
  neighborhood?: string;
  cityName?: string;
  stateName?: string;
  stateAbbreviation?: string;
  formattedCep?: string;
};

type CondominiumRow = Tables<"condominium">;
type LaunchSearchRow = Tables<"launch_search">;
type EntityLocationRow = Tables<"entity_location">;
type CityRow = Tables<"city">;
type StateRow = Tables<"state">;
type MediaRow = Tables<"media_item">;
type ListingRow = Tables<"listing">;
type ListingDetailsRow = Tables<"listing_details">;
type ListingFeaturesRow = Tables<"entity_features">;

type LaunchLocation = {
  address?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city_id?: number | null;
  state_id?: number | null;
  postal_code?: string | null;
  zip_code?: string | null;
  display_address?: string | null;
  state_name?: string | null;
  state_abbreviation?: string | null;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function getNumberField(source: Record<string, unknown> | null, key: string): number | null {
  const raw = source?.[key];
  if (typeof raw === "number") {
    return raw;
  }
  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function getStringField(source: Record<string, unknown> | null, key: string): string | null {
  const raw = source?.[key];
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseLaunchLocation(value: LaunchSearchRow["location"]): LaunchLocation | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const getString = (key: string) => getStringField(record, key);
  const getNumber = (key: string) => getNumberField(record, key);

  return {
    address: getString("address"),
    number: getString("number"),
    neighborhood: getString("neighborhood"),
    city_id: getNumber("city_id"),
    state_id: getNumber("state_id"),
    postal_code: getString("postal_code"),
    zip_code: getString("zip_code"),
    display_address: getString("display_address"),
    state_name: getString("state_name"),
    state_abbreviation: getString("state_abbreviation"),
  };
}

async function fetchAddressFromCep(rawCep?: string | null): Promise<EnrichedAddress | null> {
  if (!rawCep) return null;

  const numericCep = rawCep.replace(/[^0-9]/g, "");
  if (numericCep.length !== 8) return null;

  try {
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
    if (!viaCepResponse.ok) return null;

    const viaCepData = await viaCepResponse.json();
    if (viaCepData.erro) return null;

    const enriched: EnrichedAddress = {
      street: viaCepData.logradouro || undefined,
      neighborhood: viaCepData.bairro || undefined,
      cityName: viaCepData.localidade || undefined,
      stateAbbreviation: viaCepData.uf || undefined,
      formattedCep: `${numericCep.slice(0, 5)}-${numericCep.slice(5)}`,
    };

    const ibgeCode = viaCepData.ibge;
    if (ibgeCode) {
      const ibgeResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${ibgeCode}`);
      if (ibgeResponse.ok) {
        const ibgeData = await ibgeResponse.json();
        if (ibgeData) {
          enriched.cityName = ibgeData.nome || enriched.cityName;
          const ufData = ibgeData?.microrregiao?.mesorregiao?.UF;
          if (ufData) {
            enriched.stateName = ufData.nome || enriched.stateName;
            enriched.stateAbbreviation = ufData.sigla || enriched.stateAbbreviation;
          }
        }
      }
    }

    return enriched;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: condominium, error: condominiumError } = await supabaseAgent
      .from("condominium")
      .select("*")
      .eq("id", id)
      .single();

    if (condominiumError || !condominium) {
      return NextResponse.json({ error: "Condominium not found" }, { status: 404 });
    }

    const { data: launchSearch } = await supabaseAgent
      .from("launch_search")
      .select("*")
      .eq("id", id)
      .single();

    const launchLocation = parseLaunchLocation(launchSearch?.location ?? null);
    const condoRecord = toRecord(condominium);
    const launchRecord = toRecord(launchSearch);

    const launchDisplayAddress = getStringField(launchRecord, "display_address");
    const condoDisplayAddress = getStringField(condoRecord, "display_address");

    const deliveryForecast =
      getNumberField(launchRecord, "delivery_forecast") ??
      getNumberField(condoRecord, "delivery_forecast") ??
      condominium.year_built ??
      null;

    const mergedCondominium = {
      ...condominium,
      min_price: launchSearch?.min_price ?? condominium.min_price,
      max_price: launchSearch?.max_price ?? condominium.max_price,
      min_area: launchSearch?.min_area ?? condominium.min_area,
      max_area: launchSearch?.max_area ?? condominium.max_area,
      min_room_amount: launchSearch?.min_room_amount ?? condominium.min_room_amount,
      max_room_amount: launchSearch?.max_room_amount ?? condominium.max_room_amount,
      min_bathroom_count: launchSearch?.min_bathroom_count ?? condominium.min_bathroom_count,
      max_bathroom_count: launchSearch?.max_bathroom_count ?? condominium.max_bathroom_count,
      min_garage_count: launchSearch?.min_garage_count ?? condominium.min_garage_count,
      max_garage_count: launchSearch?.max_garage_count ?? condominium.max_garage_count,
      available_units: launchSearch?.available_units ?? condominium.available_units,
      delivery_forecast: deliveryForecast,
      display_address: launchDisplayAddress ?? condoDisplayAddress ?? null,
      ...(launchLocation ?? {}),
    };

    const { data: location } = await supabaseAgent
      .from("entity_location")
      .select("*")
      .eq("condominium_id", id)
      .eq("entity_type", "condominium")
      .single();

    const displayAddress =
      mergedCondominium.display_address ||
      location?.display_address ||
      location?.address ||
      (launchLocation?.address && launchLocation?.number
        ? `${launchLocation.address}, ${launchLocation.number}`
        : launchLocation?.address ?? null) ||
      getStringField(toRecord(mergedCondominium), "address") ||
      null;

    const cityMetadata: { city_name?: string; state_id?: number | null; state_name?: string; state_abbreviation?: string } = {};

    const mergedRecord = toRecord(mergedCondominium);
    const locationRecord = toRecord(location);

    const cityId =
      mergedCondominium.city_id ??
      getNumberField(mergedRecord, "city_id") ??
      location?.city_id ??
      getNumberField(locationRecord, "city_id") ??
      launchLocation?.city_id ??
      null;

    if (cityId) {
      const { data: city } = await supabaseAgent
        .from("city")
        .select("id, name, state_id")
        .eq("id", cityId)
        .single();

      if (city) {
        cityMetadata.city_name = city.name;
        cityMetadata.state_id = city.state_id;

        if (city.state_id) {
          const { data: state } = await supabaseAgent
            .from("state")
            .select("id, name, abbreviation")
            .eq("id", city.state_id)
            .single();

          if (state) {
            cityMetadata.state_name = state.name;
            cityMetadata.state_abbreviation = state.abbreviation;
          }
        }
      }
    }

    const postalCodeSource =
      getStringField(mergedRecord, "postal_code") ??
      location?.postal_code ??
      getStringField(locationRecord, "postal_code") ??
      launchLocation?.postal_code ??
      launchLocation?.zip_code ??
      getStringField(mergedRecord, "zip_code") ??
      null;

    const enrichedAddress = await fetchAddressFromCep(postalCodeSource);

    const normalizeString = (value?: string | number | null) => {
      if (value === null || value === undefined) {
        return null;
      }
      const trimmed = String(value).trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const normalizePostalCode = (value?: string | number | null) => {
      const normalized = normalizeString(value);
      if (!normalized) {
        return null;
      }
      const numericCep = normalized.replace(/[^0-9]/g, "");
      if (numericCep.length !== 8) {
        return normalized;
      }
      return `${numericCep.slice(0, 5)}-${numericCep.slice(5)}`;
    };

    const streetFromIbge = normalizeString(enrichedAddress?.street);
    const neighborhoodFromIbge = normalizeString(enrichedAddress?.neighborhood);
    const cityFromIbge = normalizeString(enrichedAddress?.cityName);
    const stateNameFromIbge = normalizeString(enrichedAddress?.stateName);
    const stateAbbreviationFromIbgeRaw = normalizeString(enrichedAddress?.stateAbbreviation);
    const stateAbbreviationFromIbge = stateAbbreviationFromIbgeRaw ? stateAbbreviationFromIbgeRaw.toUpperCase() : null;
    const postalCodeFromIbge = normalizePostalCode(enrichedAddress?.formattedCep);

    const existingNeighborhood = normalizeString(
      getStringField(mergedRecord, "neighborhood") ??
        location?.neighborhood ??
        getStringField(locationRecord, "neighborhood") ??
        launchLocation?.neighborhood ??
        null
    );

    const existingCityName = normalizeString(
      getStringField(mergedRecord, "city_name") ??
        getStringField(locationRecord, "city_name") ??
        cityMetadata.city_name ??
        null
    );

    const existingStateName = normalizeString(
      getStringField(mergedRecord, "state_name") ??
        getStringField(locationRecord, "state_name") ??
        cityMetadata.state_name ??
        null
    );

    const existingStateAbbreviationRaw = normalizeString(
      getStringField(mergedRecord, "state_abbreviation") ??
        getStringField(locationRecord, "state_abbreviation") ??
        cityMetadata.state_abbreviation ??
        null
    );
    const existingStateAbbreviation = existingStateAbbreviationRaw ? existingStateAbbreviationRaw.toUpperCase() : null;

    const existingPostalCode = normalizePostalCode(
      getStringField(mergedRecord, "postal_code") ??
        location?.postal_code ??
        getStringField(locationRecord, "postal_code") ??
        launchLocation?.postal_code ??
        null
    );

    const displayAddressFinal = streetFromIbge ?? normalizeString(displayAddress);
    const neighborhoodFinal = neighborhoodFromIbge ?? existingNeighborhood;
    const cityNameFinal = cityFromIbge ?? existingCityName;
    const stateNameFinal = stateNameFromIbge ?? existingStateName;
    const stateAbbreviationFinal = stateAbbreviationFromIbge ?? existingStateAbbreviation;
    const postalCodeFinal = postalCodeFromIbge ?? existingPostalCode;
    const stateIdFinal =
      cityMetadata.state_id ??
      mergedCondominium.state_id ??
      getNumberField(mergedRecord, "state_id") ??
      launchLocation?.state_id ??
      null;

    const sanitizedDisplayAddress =
      displayAddressFinal &&
      cityNameFinal &&
      displayAddressFinal.toLocaleLowerCase("pt-BR") === cityNameFinal.toLocaleLowerCase("pt-BR")
        ? null
        : displayAddressFinal;

    const sanitizedNeighborhood =
      neighborhoodFinal &&
      cityNameFinal &&
      neighborhoodFinal.toLocaleLowerCase("pt-BR") === cityNameFinal.toLocaleLowerCase("pt-BR")
        ? null
        : neighborhoodFinal;

    const { data: media } = await supabaseAgent
      .from("media_item")
      .select("*")
      .eq("entity_type", "condominium")
      .eq("condominium_id", id)
      .order("is_primary", { ascending: false });

    const featuresData = (() => {
      const raw = launchSearch?.features ?? null;
      if (!raw) return null;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return typeof raw === "object" ? raw : null;
    })();

    const extraLocationData = {
      ...(stateIdFinal ? { state_id: stateIdFinal } : {}),
      ...(sanitizedDisplayAddress ? { display_address: sanitizedDisplayAddress } : {}),
      ...(sanitizedNeighborhood ? { neighborhood: sanitizedNeighborhood } : {}),
      ...(cityNameFinal ? { city_name: cityNameFinal } : {}),
      ...(stateNameFinal ? { state_name: stateNameFinal } : {}),
      ...(stateAbbreviationFinal ? { state_abbreviation: stateAbbreviationFinal } : {}),
      ...(postalCodeFinal ? { postal_code: postalCodeFinal } : {}),
    };

    const condoResponse = {
      ...mergedCondominium,
      ...(location || {}),
      ...(featuresData ? { features: featuresData } : {}),
      ...extraLocationData,
      media: media || [],
      image: media?.find(m => m.is_primary)?.url || "/placeholder-property.jpg",
    } as const;

    const { data: apartmentListings } = await supabaseAgent
      .from("listing")
      .select("*")
      .eq("condominium_id", id)
      .eq("property_type", "residential_apartment");

    const { data: plantListings } = await supabaseAgent
      .from("listing")
      .select("*")
      .eq("condominium_id", id)
      .eq("property_type", "plant");

    type ListingSummary = ListingRow &
      Partial<ListingDetailsRow> &
      Partial<EntityLocationRow> &
      Partial<ListingFeaturesRow> & {
        media: MediaRow[];
        forRent: boolean;
        price: string;
        iptu?: string;
        image: string;
      };

    const processListings = async (listings: ListingRow[]): Promise<ListingSummary[]> => {
      if (!listings || listings.length === 0) {
        return [];
      }

      const listingIds = listings.map(l => l.listing_id);

      const [{ data: detailsList }, { data: locationsList }, { data: featuresList }, { data: mediaList }] = await Promise.all([
        supabaseAgent.from("listing_details").select("*").in("listing_id", listingIds),
        supabaseAgent.from("entity_location").select("*").eq("entity_type", "listing").in("listing_id", listingIds),
        supabaseAgent.from("entity_features").select("*").eq("entity_type", "listing").in("listing_id", listingIds),
        supabaseAgent.from("media_item").select("*").eq("entity_type", "listing").in("listing_id", listingIds).order("is_primary", { ascending: false }),
      ]);

      const detailsById = new Map((detailsList || []).map(detail => [detail.listing_id, detail] as [string, typeof detail]));
      const locationById = new Map((locationsList || []).filter(locItem => locItem?.listing_id).map(locItem => [locItem.listing_id!, locItem] as [string, typeof locItem]));
      const featuresById = new Map((featuresList || []).filter(feature => feature.listing_id).map(feature => [feature.listing_id!, feature] as [string, typeof feature]));
      const mediaById = new Map<string, MediaRow[]>([]);
      (mediaList || []).forEach(mediaItem => {
        const key = mediaItem.listing_id ?? "";
        if (!key) {
          return;
        }
        const arr = mediaById.get(key) || [];
        arr.push(mediaItem);
        mediaById.set(key, arr);
      });

      return listings.map(listing => {
        const details = detailsById.get(listing.listing_id) ?? null;
        const loc = locationById.get(listing.listing_id) ?? null;
        const feat = featuresById.get(listing.listing_id) ?? null;
        const listingMedia = mediaById.get(listing.listing_id) ?? [];

        const price =
          listing.transaction_type === "rent"
            ? listing.rental_price_amount
              ? `R$ ${(Number(listing.rental_price_amount) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "Preço sob consulta"
            : listing.list_price_amount
              ? `R$ ${(Number(listing.list_price_amount) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "Preço sob consulta";

        const iptuFormatted =
          details?.iptu_amount !== null && details?.iptu_amount !== undefined
            ? `R$ ${(Number(details.iptu_amount) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            : undefined;

        return {
          ...listing,
          ...(details ?? {}),
          ...(loc ?? {}),
          ...(feat ?? {}),
          media: listingMedia,
          forRent: listing.transaction_type === "rent",
          price,
          iptu: iptuFormatted,
          image: listingMedia.find(mediaItem => mediaItem.is_primary)?.url || "/placeholder-property.jpg",
        };
      });
    };

    const [apartments, plants] = await Promise.all([
      processListings(apartmentListings || []),
      processListings(plantListings || []),
    ]);

    return NextResponse.json({
      ...condoResponse,
      apartments,
      plants,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

