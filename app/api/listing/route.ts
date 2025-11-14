import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { translatePropertyTypeToDB, getAllPropertyTypes } from "../../../lib/propertyTypes";
import { Database } from "../../../types/database";

type ListingSearchRow = Database["public"]["Views"]["listing_search"]["Row"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const transactionType = searchParams.get("transactionType");
    const limit = Number(searchParams.get("limit") || 30);
    const offset = Number(searchParams.get("offset") || 0);

    if (!cityId || !transactionType) {
      return NextResponse.json({ error: "cityId e transactionType são obrigatórios" }, { status: 400 });
    }

    const agencyId = process.env.LOCATION_ID;

    if (!agencyId) {
      return NextResponse.json({ error: "LOCATION_ID not configured" }, { status: 500 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: "Supabase environment variables not configured" }, { status: 500 });
    }

    const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const tipo = searchParams.get("tipo");
    const bairro = searchParams.get("bairro");

    const buildBaseQuery = (adTypes: string[], includeCityFilter: boolean = true) => {
      let baseQuery = supabase
        .from('listing_search')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('transaction_type', transactionType === "rent" ? "rent" : "sale")
        .in('ad_type', adTypes as Array<"standard" | "premium" | "superPremium" | "premiere1" | "premiere2" | "triple" | "paused" | "inactive" | null>);

      if (includeCityFilter && cityId) {
        baseQuery = baseQuery.eq('city_id', parseInt(cityId));
      }

      if (bairro) {
        baseQuery = baseQuery.eq('neighborhood', bairro);
      }

      if (tipo) {
        const dbPropertyTypes: string[] = [];

        const tipoArray = tipo.includes(",") ? tipo.split(",").map(t => t.trim()) : [tipo];

        const allTypes = getAllPropertyTypes();
        const displayToDbMap = new Map<string, Set<string>>();
        allTypes.forEach(({ dbValue, displayValue }) => {
          if (!displayToDbMap.has(displayValue)) {
            displayToDbMap.set(displayValue, new Set());
          }
          displayToDbMap.get(displayValue)!.add(dbValue);
        });

        tipoArray.forEach(tipoItem => {
          if (tipoItem.startsWith('residential_') || tipoItem.startsWith('commercial_')) {
            dbPropertyTypes.push(tipoItem);
          } else {
            const translated = translatePropertyTypeToDB(tipoItem);
            if (translated && translated !== tipoItem) {
              dbPropertyTypes.push(translated);
            }

            const dbTypesForDisplay = displayToDbMap.get(tipoItem);
            if (dbTypesForDisplay) {
              dbTypesForDisplay.forEach(dbType => dbPropertyTypes.push(dbType));
            }
          }
        });

        const uniqueDbTypes = Array.from(new Set(dbPropertyTypes));

        if (uniqueDbTypes.length > 0) {
          type PropertyType = NonNullable<Database["public"]["Views"]["listing_search"]["Row"]["property_type"]>;
          const filteredTypes = uniqueDbTypes.filter((t): t is PropertyType => t !== null && t !== undefined) as PropertyType[];
          if (filteredTypes.length === 1) {
            baseQuery = baseQuery.eq('property_type', filteredTypes[0]);
          } else if (filteredTypes.length > 1) {
            baseQuery = baseQuery.in('property_type', filteredTypes);
          }
        }
      }

      return baseQuery;
    };

    const fetchItemsByAdType = async (adTypes: string[], fetchLimit: number, excludeIds: Set<string>, includeCityFilter: boolean = true): Promise<ListingSearchRow[]> => {
      const query = buildBaseQuery(adTypes, includeCityFilter)
        .order('list_price_amount', { ascending: false, nullsFirst: false })
        .limit(fetchLimit * 2);
      const { data } = await query;

      if (!data || data.length === 0) {
        return [];
      }

      return data.filter((item: ListingSearchRow) => item.listing_id && !excludeIds.has(item.listing_id));
    };

    const processItem = async (item: ListingSearchRow) => {
      try {
        let allMedia: Array<{
          id: string;
          url: string;
          caption: string | null;
          is_primary: boolean;
          order: number | null;
        }> = [];
        let mediaCount = 0;

        if (item.primary_media_url && item.listing_id) {
          const { data: mediaData, error: mediaError } = await supabase
            .from('media_item')
            .select('id, url, caption, is_primary, order')
            .eq('listing_id', item.listing_id)
            .order('order', { ascending: true });

          if (mediaError) {
            allMedia = [{
              id: 'primary',
              url: item.primary_media_url,
              caption: 'Imagem principal',
              is_primary: true,
              order: 1
            }];
            mediaCount = 1;
          } else if (mediaData && mediaData.length > 0) {
            allMedia = mediaData;
            mediaCount = allMedia.length;
          } else {
            allMedia = [{
              id: 'primary',
              url: item.primary_media_url,
              caption: 'Imagem principal',
              is_primary: true,
              order: 1
            }];
            mediaCount = 1;
          }
        }

        let features = item.features;
        if (features && typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch {
            features = null;
          }
        }

        const listPriceAmount = item.list_price_amount ? item.list_price_amount / 100 : null;
        const rentalPriceAmount = item.rental_price_amount ? item.rental_price_amount / 100 : null;
        const iptuAmount = item.iptu_amount ? item.iptu_amount / 100 : null;
        const propertyAdminFeeAmount = item.property_administration_fee_amount ? item.property_administration_fee_amount / 100 : null;
        const spuAmount = item.spu ? Number(item.spu) / 100 : null;

        return {
          listing_id: item.listing_id,
          title: item.title,
          transaction_type: item.transaction_type,
          agency_id: item.agency_id,
          list_price_amount: listPriceAmount,
          rental_price_amount: rentalPriceAmount,
          rental_period: item.rental_period || null,
          public_id: item.listing_id,
          description: item.description || null,
          area: item.total_area || item.built_area || null,
          bathroom_count: item.bathroom_count || null,
          bedroom_count: item.bedroom_count || null,
          garage_count: item.garage_count || null,
          suite_count: null,
          year_built: (item as ListingSearchRow & { year_built?: number | null }).year_built || null,
          built_area: item.built_area || null,
          land_area: item.land_area || null,
          private_area: item.private_area || null,
          display_address: item.display_address || 'Endereço não informado',
          neighborhood: item.neighborhood || 'Bairro não informado',
          address: item.display_address || 'Endereço não informado',
          city_id: item.city_id,
          state_id: item.state_id,
          property_type: item.property_type,
          condominium_id: item.condominium_location_id || item.listing_location_id || null,
          features: features,
          property_administration_fee_amount: propertyAdminFeeAmount,
          property_administration_fee_period: item.property_administration_fee_period || null,
          iptu_amount: iptuAmount,
          iptu_period: item.iptu_period || null,
          spu: spuAmount ? spuAmount.toString() : null,
          spu_period: item.spu_period || null,
          primary_image_url: item.primary_media_url || "/placeholder-property.jpg",
          image: item.primary_media_url || "/placeholder-property.jpg",
          media_count: mediaCount,
          media: allMedia.map((m) => ({
            id: m.id,
            url: m.url,
            caption: m.caption,
            is_primary: m.is_primary,
            order: m.order
          })),
          price: listPriceAmount ? `R$ ${listPriceAmount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
          price_formatted: listPriceAmount ? `R$ ${listPriceAmount.toLocaleString('pt-BR')}` : 'Preço sob consulta',
          for_rent: item.transaction_type === 'rent',
          forRent: item.transaction_type === 'rent'
        };
      } catch {
        return null;
      }
    };

    type ProcessedListing = Awaited<ReturnType<typeof processItem>>;
    const validResults: NonNullable<ProcessedListing>[] = [];
    const processedIds = new Set<string>();
    let attempts = 0;
    const maxAttempts = 5;
    let useCityFilter = true;

    while (validResults.length < limit && attempts < maxAttempts) {
      attempts++;
      const remaining = limit - validResults.length;

      const itemsToProcess: ListingSearchRow[] = [];

      if (validResults.length === 0) {
        const superPremiumItems = await fetchItemsByAdType(['superPremium'], limit, processedIds, useCityFilter);
        itemsToProcess.push(...superPremiumItems);

        const remainingAfterSuperPremium = limit - itemsToProcess.length;
        if (remainingAfterSuperPremium > 0) {
          const premiumItems = await fetchItemsByAdType(['premium'], remainingAfterSuperPremium, processedIds, useCityFilter);
          itemsToProcess.push(...premiumItems);
        }

        const remainingAfterPremium = limit - itemsToProcess.length;
        if (remainingAfterPremium > 0) {
          const standardItems = await fetchItemsByAdType(['standard'], remainingAfterPremium, processedIds, useCityFilter);
          itemsToProcess.push(...standardItems);
        }
      } else {
        const superPremiumItems = await fetchItemsByAdType(['superPremium'], remaining, processedIds, useCityFilter);
        itemsToProcess.push(...superPremiumItems);

        const remainingAfterSuperPremium = remaining - itemsToProcess.length;
        if (remainingAfterSuperPremium > 0) {
          const premiumItems = await fetchItemsByAdType(['premium'], remainingAfterSuperPremium, processedIds, useCityFilter);
          itemsToProcess.push(...premiumItems);
        }

        const remainingAfterPremium = remaining - itemsToProcess.length;
        if (remainingAfterPremium > 0) {
          const standardItems = await fetchItemsByAdType(['standard'], remainingAfterPremium, processedIds, useCityFilter);
          itemsToProcess.push(...standardItems);
        }
      }

      if (itemsToProcess.length === 0 && useCityFilter) {
        useCityFilter = false;
        continue;
      }

      if (itemsToProcess.length === 0) {
        break;
      }

      const processed = await Promise.all(itemsToProcess.map(item => processItem(item)));
      const newValidResults = processed.filter((r): r is NonNullable<typeof r> => r !== null);

      for (const result of newValidResults) {
        if (result.listing_id && !processedIds.has(result.listing_id) && validResults.length < limit) {
          validResults.push(result);
          processedIds.add(result.listing_id);
        }
      }

      if (newValidResults.length === 0 && useCityFilter) {
        useCityFilter = false;
        continue;
      }

      if (newValidResults.length === 0) {
        break;
      }
    }

    return NextResponse.json(validResults.slice(offset, offset + limit));
  } catch (error: unknown) {
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
