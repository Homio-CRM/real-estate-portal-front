"use client";
import { ComponentType, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bath,
  Bed,
  Building,
  Calendar,
  Car,
  MapPin,
  MoreHorizontal,
  Phone,
  Mail,
  Ruler,
  User
} from "lucide-react";
import Header from "../../../components/Header";
import ListingDetailSkeleton from "../../../components/ListingDetailSkeleton";
import { CondominiumCard, PropertyCard } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import Footer from "../../../components/Footer";
import ContactForm from "../../../components/ContactForm";
import PlantTabs from "../../../components/PlantTabs";
import { cleanHtmlText } from "../../../lib/utils";
import { ImageGallery } from "../../../components/ImageGallery";
import { DetailMediaCarousel } from "../../../components/DetailMediaCarousel";
import { getAmenityIcon, getFeatureInfo } from "../../../lib/detailFeatures";
import { formatPrice, toSentenceCase } from "../../../lib/detailFormatters";
import { getStateAbbreviationById } from "../../../lib/brazilianStates";

type CondominiumDetail = CondominiumCard & {
  apartments?: PropertyCard[];
  plants?: PropertyCard[];
};

type CondominiumStats = {
  min_bedrooms: number;
  max_bedrooms: number;
  min_suites: number;
  max_suites: number;
  avg_condo_fee: number;
  avg_iptu: number;
  total_apartments: number;
};

export default function CondominiumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [condo, setCondo] = useState<CondominiumDetail | null>(null);
  const [stats, setStats] = useState<CondominiumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [cityName, setCityName] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCondoDetails() {
      if (!params.id) {
        return;
      }

      const condoId = params.id as string;
      let hadCached = false;

      if (typeof window !== "undefined") {
        const cachedRaw = sessionStorage.getItem(`condominium_${condoId}`);
        if (cachedRaw) {
          try {
            const cachedData = JSON.parse(cachedRaw) as CondominiumDetail;
            hadCached = true;
            if (isMounted) {
              setCondo(cachedData);
              setLoading(false);
            }
          } catch {
          }
        }
      }

      try {
        const [condoRes, statsRes] = await Promise.all([
          fetch(`/api/condominium/${condoId}`),
          fetch(`/api/condominium/${condoId}/stats`)
        ]);

        if (!isMounted) {
          return;
        }

        if (condoRes.ok) {
          const condoData = await condoRes.json();
          setCondo((prev) => {
            const next = { ...(prev ?? {}), ...condoData } as CondominiumDetail;
            if (typeof window !== "undefined") {
              try {
                sessionStorage.setItem(`condominium_${condoId}`, JSON.stringify(next));
              } catch {
              }
            }
            return next;
          });
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (!hadCached) {
          setLoading(false);
        }
      } catch {
        if (!isMounted) {
          return;
        }
        if (!hadCached) {
          setLoading(false);
        }
      }
    }

    fetchCondoDetails();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  useEffect(() => {
    const fetchCityName = async () => {
      if (condo?.city_id && !cityName) {
        try {
          const response = await fetch(`/api/cities?id=${condo.city_id}`);
          if (response.ok) {
            const city = await response.json();
            if (city && city.name) {
              setCityName(city.name);
            }
          }
        } catch { }
      }
    };

    fetchCityName();
  }, [condo?.city_id, cityName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!condo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showLogo={false} />
        <div className="pt-4">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Condomínio não encontrado</h1>
              <button onClick={() => router.back()} className="text-primary hover:underline">Voltar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const apartments = Array.isArray(condo.apartments) ? condo.apartments : [];

  const featuresData = (() => {
    const raw = condo && "features" in condo ? (condo as CondominiumDetail & { features?: unknown }).features : null;
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : null;
      } catch {
        return null;
      }
    }
    if (typeof raw === "object" && raw !== null) {
      return raw;
    }
    return null;
  })();

  const parseNumeric = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      if (Number.isNaN(value) || value <= 0) {
        return null;
      }
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  };

  const featureEntries = (() => {
    const featuresRaw = featuresData;
    if (!featuresRaw || typeof featuresRaw !== "object") {
      return [] as Array<{ key: string; label: string; icon: ComponentType<{ size?: number; className?: string }> }>;
    }

    const othersLabel = typeof featuresRaw.others_label === "string" ? featuresRaw.others_label : null;

    const active = Object.entries(featuresRaw)
      .filter(([key, value]) => value === true && typeof key === "string")
      .map(([key]) => key)
      .filter(
        (key) =>
          key !== "others_label" &&
          key !== "listing_id" &&
          key !== "condominium_id" &&
          key !== "entity_type" &&
          key !== "id" &&
          key !== "club_id" &&
          key !== "created_by"
      );

    if (othersLabel) {
      active.push("others_label");
    }

    return active.map((key) => {
      if (key === "others_label" && othersLabel) {
        return { key, label: othersLabel, icon: MoreHorizontal };
      }

      const info = getFeatureInfo(key);
      return { key, label: info.label, icon: info.icon };
    });
  })();

  const combinedFeatureEntries = featureEntries;

  const getNumericRangeText = (
    minValue?: number | string | null,
    maxValue?: number | string | null,
    fallbackExtractor?: (apartment: PropertyCard) => number | string | null | undefined
  ) => {
    let min = parseNumeric(minValue ?? null) ?? undefined;
    let max = parseNumeric(maxValue ?? null) ?? undefined;

    if (fallbackExtractor) {
      const fallbackValues = apartments
        .map((apartment) => parseNumeric(fallbackExtractor(apartment)))
        .filter((value): value is number => value !== null);

      if (fallbackValues.length > 0) {
        if (min === undefined) {
          min = Math.min(...fallbackValues);
        }
        if (max === undefined) {
          max = Math.max(...fallbackValues);
        }
      }
    }

    if (min === undefined && max === undefined) {
      return null;
    }

    if (min !== undefined && max !== undefined) {
      if (min === max) {
        return `${min}`;
      }
      return `${min} - ${max}`;
    }

    if (min !== undefined) {
      return `A partir de ${min}`;
    }

    if (max !== undefined) {
      return `Até ${max}`;
    }

    return null;
  };

  const statsAny = stats as Record<string, unknown> | null;
  const getNumericValue = (value: unknown): number | null => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const bedroomRange = getNumericRangeText(
    condo.min_room_amount ?? stats?.min_bedrooms ?? null,
    condo.max_room_amount ?? stats?.max_bedrooms ?? null,
    (apartment) => apartment.bedroom_count
  );
  const bathroomRange = getNumericRangeText(
    condo.min_bathroom_count ?? getNumericValue(statsAny?.min_bathrooms) ?? null,
    condo.max_bathroom_count ?? getNumericValue(statsAny?.max_bathrooms) ?? null,
    (apartment) => apartment.bathroom_count
  );
  const parkingRange = getNumericRangeText(
    condo.min_garage_count ??
    getNumericValue(statsAny?.min_parking_spaces) ??
    getNumericValue(statsAny?.min_parking) ??
    getNumericValue(statsAny?.min_garage) ??
    getNumericValue(statsAny?.min_garages) ??
    null,
    condo.max_garage_count ??
    getNumericValue(statsAny?.max_parking_spaces) ??
    getNumericValue(statsAny?.max_parking) ??
    getNumericValue(statsAny?.max_garage) ??
    getNumericValue(statsAny?.max_garages) ??
    null,
    (apartment) => apartment.garage_count
  );

  const normalizePriceValue = (value?: number | null) => {
    if (typeof value !== "number") {
      return null;
    }
    if (value >= 1000000) {
      return value / 100;
    }
    if (value < 10000) {
      return value * 100;
    }
    return value;
  };

  const formatPriceFromCents = (value?: number | null) => {
    const normalized = normalizePriceValue(value);
    if (normalized === null) return null;
    return formatPrice(normalized);
  };

  const formatPriceRange = () => {
    const minPrice = condo.min_price ?? null;
    const maxPrice = condo.max_price ?? null;

    const formattedMin = formatPriceFromCents(minPrice);
    const formattedMax = formatPriceFromCents(maxPrice);

    if (formattedMin && formattedMax) {
      if (minPrice === maxPrice) {
        return formattedMin;
      }
      return `${formattedMin} - ${formattedMax}`;
    }
    if (formattedMin) {
      return `A partir de ${formattedMin}`;
    }
    if (formattedMax) {
      return `Até ${formattedMax}`;
    }
    return "Preço sob consulta";
  };

  const formatAreaRange = () => {
    if (condo.min_area && condo.max_area) {
      if (condo.min_area === condo.max_area) {
        return `${condo.min_area} m²`;
      }
      return `${condo.min_area} - ${condo.max_area} m²`;
    }
    if (condo.min_area) {
      return `A partir de ${condo.min_area} m²`;
    }
    if (condo.max_area) {
      return `Até ${condo.max_area} m²`;
    }
    return "Área sob consulta";
  };

  const buildBreadcrumbs = () => {
    const breadcrumbs: string[] = [];

    breadcrumbs.push("Venda");

    const stateAbbrev = condo.state_id ? getStateAbbreviationById(condo.state_id) : null;
    if (stateAbbrev) {
      breadcrumbs.push(stateAbbrev.toUpperCase());
    }

    breadcrumbs.push("Lançamento à venda");

    const addressParts: string[] = [];

    const hasValidNeighborhood = condo?.neighborhood && 
      condo.neighborhood.trim() !== "" && 
      condo.neighborhood.toLowerCase() !== "bairro não informado" &&
      condo.neighborhood.toLowerCase() !== "bairro nao informado";
    
    let neighborhoodToUse = null;
    
    if (hasValidNeighborhood) {
      neighborhoodToUse = condo.neighborhood;
    } else if (condo.display_address) {
      const displayAddressParts = condo.display_address.split(",").map(part => part.trim());
      for (let i = 1; i < displayAddressParts.length; i++) {
        const potentialNeighborhood = displayAddressParts[i];
        if (potentialNeighborhood && 
            potentialNeighborhood.toLowerCase() !== cityName?.toLowerCase() &&
            potentialNeighborhood.toLowerCase() !== stateAbbrev?.toLowerCase() &&
            !potentialNeighborhood.match(/^\d{5}-?\d{3}$/)) {
          neighborhoodToUse = potentialNeighborhood;
          break;
        }
      }
    }
    
    if (neighborhoodToUse) {
      addressParts.push(toSentenceCase(neighborhoodToUse));
    }

    if (cityName) {
      addressParts.push(toSentenceCase(cityName));
    }

    if (addressParts.length > 0) {
      breadcrumbs.push(addressParts.join(", "));
    }

    return breadcrumbs;
  };

  const formatDisplayAddress = () => {
    const addressParts: string[] = [];
    const seen = new Set<string>();

    const addPart = (value?: string | null, transform?: (input: string) => string) => {
      if (value === null || value === undefined) {
        return;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      const transformed = transform ? transform(trimmed) : trimmed;
      const key = transformed.toLocaleLowerCase("pt-BR");
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      addressParts.push(transformed);
    };

    const street = condo.display_address || (condo && "address" in condo ? String((condo as CondominiumDetail & { address?: unknown }).address || "") : "") || "";
    addPart(street);

    addPart(condo.neighborhood, toSentenceCase);
    addPart(condo.city_name, toSentenceCase);

    if (condo.state_abbreviation) {
      addPart(condo.state_abbreviation.toUpperCase());
    } else {
      addPart(condo.state_name, toSentenceCase);
    }

    const cepSegment = (() => {
      if (!condo.postal_code) return null;
      const numericCep = condo.postal_code.replace(/[^0-9]/g, "");
      if (numericCep.length !== 8) return null;
      return `${numericCep.slice(0, 5)}-${numericCep.slice(5)}`;
    })();

    if (addressParts.length === 0 && !cepSegment) {
      return "Endereço não informado";
    }

    const base = addressParts.join(", ");

    if (cepSegment) {
      return base ? `${base} - ${cepSegment}` : cepSegment;
    }

    return base || "Endereço não informado";
  };

  const breadcrumbs = buildBreadcrumbs();

  const areaText = formatAreaRange();
  const deliveryForecastRaw = (condo && "delivery_forecast" in condo ? (condo as CondominiumDetail & { delivery_forecast?: unknown }).delivery_forecast : null) ?? condo.year_built ?? null;
  const deliveryForecastNumeric = parseNumeric(deliveryForecastRaw);
  const deliveryForecastValue =
    deliveryForecastNumeric !== null
      ? `${deliveryForecastNumeric}`
      : typeof deliveryForecastRaw === "string" && deliveryForecastRaw.trim().length > 0
        ? deliveryForecastRaw.trim()
        : null;
  const condoAvailableUnits = parseNumeric(condo.available_units);
  const statsAvailableUnits = parseNumeric(statsAny?.available_units);
  const fallbackAvailableUnits = apartments.length > 0 ? apartments.length : null;
  const availableUnits = statsAvailableUnits ?? condoAvailableUnits ?? fallbackAvailableUnits;

  const dealType = "launch" as const;
  const priceFromCents = (value?: number | null) => {
    const normalized = normalizePriceValue(value);
    if (normalized === null) {
      return null;
    }
    return normalized;
  };
  const propertyPriceValue = priceFromCents(condo.max_price ?? condo.min_price ?? null);
  const propertyPublicId =
    (condo as unknown as { public_id?: string })?.public_id ??
    condo.id ??
    "";

  const statsItems: Array<{ icon: ComponentType<{ size?: number; className?: string }>; label: string; value: string }> = [];

  if (areaText && areaText !== "Área sob consulta") {
    statsItems.push({ icon: Ruler, label: "Área", value: areaText });
  }

  if (bedroomRange) {
    statsItems.push({ icon: Bed, label: "Dormitórios", value: bedroomRange });
  }

  if (bathroomRange) {
    statsItems.push({ icon: Bath, label: "Banheiros", value: bathroomRange });
  }

  if (parkingRange) {
    statsItems.push({ icon: Car, label: "Vagas de garagem", value: parkingRange });
  }

  if (deliveryForecastValue) {
    statsItems.push({ icon: Calendar, label: "Previsão de entrega", value: deliveryForecastValue });
  }

  if (availableUnits !== null && availableUnits !== undefined) {
    statsItems.push({ icon: Building, label: "Unidades disponíveis", value: `${availableUnits}` });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogo={false} />
      <div>
        <DetailMediaCarousel
          media={condo.media}
          title={condo.name}
          onImageClick={() => setShowGallery(true)}
          onBack={() => router.back()}
        />

        {breadcrumbs.length > 0 && (
          <div className="mx-auto w-full max-w-7xl px-0 sm:px-4 mt-4 text-sm text-gray-600">
            <div className="px-6">
              {breadcrumbs.join(" / ")}
            </div>
          </div>
        )}

        <div className="relative mx-auto w-full max-w-7xl px-0 sm:px-4">
          <div className="absolute right-0 -top-[80px] z-20 w-[360px] max-w-[calc(50%-1rem)] hidden xl:block">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 m-0 p-0" id="contact-form">
              <ContactForm
                propertyId={condo.id || ""}
                propertyPublicId={propertyPublicId}
                propertyUrl={pageUrl ?? undefined}
                propertyPrice={propertyPriceValue}
                dealType={dealType}
              />
            </div>
          </div>

          <div className="py-6 xl:pr-[420px]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {toSentenceCase(cleanHtmlText(condo.name))}
                </h1>
                <div className="flex flex-wrap gap-6 items-center text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 tracking-wide mb-1">Faixa de preço do lançamento</div>
                    <div className="text-xl font-semibold text-primary">{formatPriceRange()}</div>
                  </div>
                  {stats && stats.avg_condo_fee > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Taxa média de condomínio</div>
                      <div className="text-base font-semibold text-gray-900">{formatPrice(stats.avg_condo_fee)}</div>
                    </div>
                  )}
                  {stats && stats.avg_iptu > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">IPTU médio</div>
                      <div className="text-base font-semibold text-gray-900">{formatPrice(stats.avg_iptu)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {statsItems.map(({ icon: IconComponent, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-gray-700 break-words">
                    <IconComponent size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <div className="font-bold text-lg">{value}</div>
                      <div className="text-sm text-gray-500">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <MapPin size={20} className="text-primary" />
                  Localização
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>{formatDisplayAddress()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {combinedFeatureEntries.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acomodações</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {combinedFeatureEntries.map(({ key, label, icon: IconComponent }) => (
                      <div key={key} className="flex items-center gap-3 text-gray-700 break-words">
                        <IconComponent size={24} className="text-primary flex-shrink-0" />
                        <span className="text-sm sm:text-base">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {condo.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-700 whitespace-pre-line">{cleanHtmlText(condo.description)}</p>
                </div>
              )}
            </div>

            {Array.isArray(condo.plants) && condo.plants.length > 0 && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Plantas do Lançamento</h3>
                  </div>
                  <PlantTabs plants={condo.plants} />
                </div>
              </div>
            )}

            {Array.isArray(condo.apartments) && condo.apartments.length > 0 && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Apartamentos Disponíveis neste Condomínio</h2>
                <div className="space-y-4">
                  {condo.apartments.map((apartment) => (
                    <HorizontalPropertyCard key={apartment.listing_id} {...apartment} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="xl:hidden mb-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200" id="contact-form-mobile">
              <ContactForm
                propertyId={condo.id || ""}
                propertyPublicId={propertyPublicId}
                propertyUrl={pageUrl ?? undefined}
                propertyPrice={propertyPriceValue}
                dealType={dealType}
              />
            </div>
          </div>
        </div>
      </div>

      {showGallery && condo && condo.media && (
        <ImageGallery
          mediaItems={condo.media.map((item) => ({
            id: item.id || "",
            url: item.url,
            caption: item.caption,
            is_primary: item.is_primary,
          }))}
          onClose={() => setShowGallery(false)}
        />
      )}

      <Footer />
    </div>
  );
}



