"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bath,
  Bed,
  Building,
  Car,
  Calendar,
  Layers,
  MapPin,
  MoreHorizontal,
  Ruler,
  Sprout,
  Home
} from "lucide-react";
import Header from "../../../components/Header";
import ListingDetailSkeleton from "../../../components/ListingDetailSkeleton";
import { fetchListingById, fetchListings } from "../../../lib/fetchListings";
import { CondominiumCard, PropertyCard as PropertyCardType } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import ContactForm from "../../../components/ContactForm";
import Footer from "../../../components/Footer";
import { translatePropertyType } from "../../../lib/propertyTypes";
import { ImageGallery } from "../../../components/ImageGallery";
import { getStateAbbreviationById } from "../../../lib/brazilianStates";
import { cleanHtmlText } from "../../../lib/utils";
import { getFeatureInfo } from "../../../lib/detailFeatures";
import { formatPrice, toSentenceCase, translatePeriod } from "../../../lib/detailFormatters";
import { DetailMediaCarousel } from "../../../components/DetailMediaCarousel";
import { formatCurrency } from "../../../lib/formatCurrency";
import { Json } from "../../../types/database";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyCardType | null>(null);
  const [similarProperties, setSimilarProperties] = useState<PropertyCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [condominiumInfo, setCondominiumInfo] = useState<(Pick<CondominiumCard, "id" | "name" | "min_price" | "max_price" | "min_area" | "max_area"> & { features?: Record<string, Json> | null }) | null>(null);
  const parseFeaturesObject = (input: unknown): Record<string, Json> | null => {
    if (!input) {
      return null;
    }
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, Json>;
        }
      } catch {
        return null;
      }
      return null;
    }
    if (typeof input === "object" && !Array.isArray(input)) {
      return input as Record<string, Json>;
    }
    return null;
  };

  const [showGallery, setShowGallery] = useState(false);
  const [cityName, setCityName] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const listingFeatures = useMemo(
    () => parseFeaturesObject((property as { features?: unknown } | null)?.features),
    [property],
  );
  const resolvedFeatures = condominiumInfo?.features ?? listingFeatures;

  useEffect(() => {
    const fetchCityName = async () => {
      if (property?.city_id && !cityName) {
        try {
          const response = await fetch(`/api/cities?id=${property.city_id}`);
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
  }, [property?.city_id, cityName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;

      const listingId = params.id as string;

      if (typeof window !== 'undefined') {
        const cachedData = sessionStorage.getItem(`listing_${listingId}`);
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            setProperty(parsedData);
            setLoading(false);

            if (!parsedData) return;

            const txType = parsedData.transaction_type === "rental" ? "rent" : "sale";

            if (parsedData.property_type === "apartment" && parsedData.condominium_id) {
              try {
                const res = await fetch(`/api/condominium/${parsedData.condominium_id}`);
                if (res.ok) {
                  const condo = await res.json();
                  const condoFeatures = parseFeaturesObject(condo?.features);
                  setCondominiumInfo({
                    id: condo.id || parsedData.condominium_id,
                    name: condo.name,
                    min_price: condo.min_price,
                    max_price: condo.max_price,
                    min_area: condo.min_area,
                    max_area: condo.max_area,
                    features: condoFeatures,
                  });
                  const inSameCondo: PropertyCardType[] = (Array.isArray(condo.apartments) ? condo.apartments : [])
                    .filter((p: PropertyCardType) => p.listing_id !== parsedData.listing_id)
                    .slice(0, 3);
                  if (inSameCondo.length > 0) {
                    setSimilarProperties(inSameCondo);
                    return;
                  }
                }
              } catch { }
            }

            if (parsedData.neighborhood) {
              try {
                const byNeighborhood = await fetchListings({
                  cityId: parsedData.city_id,
                  transactionType: txType,
                  tipo: parsedData.property_type === "apartment" ? "Apartamento" : "Casa",
                  bairro: parsedData.neighborhood,
                  limit: 6,
                  offset: 0,
                });
                const filtered = byNeighborhood.filter((p: PropertyCardType) => p.listing_id !== parsedData.listing_id).slice(0, 3);
                if (filtered.length > 0) {
                  setSimilarProperties(filtered);
                  return;
                }
              } catch { }
            }

            try {
              const byCity = await fetchListings({
                cityId: parsedData.city_id,
                transactionType: txType,
                tipo: parsedData.property_type === "apartment" ? "Apartamento" : "Casa",
                limit: 6,
                offset: 0,
              });
              const filtered = byCity.filter((p: PropertyCardType) => p.listing_id !== parsedData.listing_id).slice(0, 3);
              setSimilarProperties(filtered);
            } catch {
              setSimilarProperties([]);
            }

            return;
          } catch { }
        }
      }

      const data = await fetchListingById(listingId);
      setProperty(data);
      setLoading(false);

      if (!data) return;

      const txType = data.transaction_type === "rental" ? "rent" : "sale";

      if (data.property_type === "apartment" && data.condominium_id) {
        try {
          const res = await fetch(`/api/condominium/${data.condominium_id}`);
          if (res.ok) {
            const condo = await res.json();
            const condoFeatures = parseFeaturesObject(condo?.features);
            setCondominiumInfo({
              id: condo.id || data.condominium_id,
              name: condo.name,
              min_price: condo.min_price,
              max_price: condo.max_price,
              min_area: condo.min_area,
              max_area: condo.max_area,
              features: condoFeatures,
            });
            const inSameCondo: PropertyCardType[] = (Array.isArray(condo.apartments) ? condo.apartments : [])
              .filter((p: PropertyCardType) => p.listing_id !== data.listing_id)
              .slice(0, 3);
            if (inSameCondo.length > 0) {
              setSimilarProperties(inSameCondo);
              return;
            }
          }
        } catch { }
      }

      if (data.neighborhood) {
        try {
          const byNeighborhood = await fetchListings({
            cityId: data.city_id,
            transactionType: txType,
            tipo: data.property_type === "apartment" ? "Apartamento" : "Casa",
            bairro: data.neighborhood,
            limit: 6,
            offset: 0,
          });
          const filtered = byNeighborhood.filter((p: PropertyCardType) => p.listing_id !== data.listing_id).slice(0, 3);
          if (filtered.length > 0) {
            setSimilarProperties(filtered);
            return;
          }
        } catch { }
      }

      try {
        const byCity = await fetchListings({
          cityId: data.city_id,
          transactionType: txType,
          tipo: data.property_type === "apartment" ? "Apartamento" : "Casa",
          limit: 6,
          offset: 0,
        });
        const filtered = byCity.filter((p: PropertyCardType) => p.listing_id !== data.listing_id).slice(0, 3);
        setSimilarProperties(filtered);
      } catch {
        setSimilarProperties([]);
      }
    }
    fetchProperty();
  }, [params.id]);

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showLogo={false} />
        <div className="pt-8">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Imóvel não encontrado
              </h1>
              <button
                onClick={() => router.back()}
                className="text-primary hover:underline"
              >
                Voltar aos listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const buildBreadcrumbs = () => {
    const breadcrumbs: string[] = [];

    breadcrumbs.push(property.forRent ? "Aluguel" : "Venda");

    const stateAbbrev = property.state_id ? getStateAbbreviationById(property.state_id) : null;
    if (stateAbbrev) {
      breadcrumbs.push(stateAbbrev.toUpperCase());
    }

    breadcrumbs.push(
      `${translatePropertyType(property.property_type || "")} ${property.forRent ? "à aluguel" : "à venda"}`
    );

    const addressParts: string[] = [];

    const hasValidNeighborhood = property?.neighborhood && 
      property.neighborhood.trim() !== "" && 
      property.neighborhood.toLowerCase() !== "bairro não informado" &&
      property.neighborhood.toLowerCase() !== "bairro nao informado";
    
    let neighborhoodToUse = null;
    
    if (hasValidNeighborhood) {
      neighborhoodToUse = property.neighborhood;
    } else if (property.display_address) {
      const displayAddressParts = property.display_address.split(",").map(part => part.trim());
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
    const parts: string[] = [];

    if (property.neighborhood) {
      parts.push(toSentenceCase(property.neighborhood));
    }

    if (cityName) {
      parts.push(toSentenceCase(cityName));
    }

    if (property.state_id) {
      const stateAbbrev = getStateAbbreviationById(property.state_id);
      if (stateAbbrev) {
        parts.push(stateAbbrev.toUpperCase());
      }
    }

    return parts.length > 0 ? parts.join(", ") : property.display_address || "Endereço não informado";
  };

  const breadcrumbs = buildBreadcrumbs();
  const dealType: "rent" | "sale" = property.forRent ? "rent" : "sale";
  const mainPriceValue = property.forRent ? property.rental_price_amount : property.list_price_amount;
  const hasValidNumericPrice = typeof mainPriceValue === "number" && Number.isFinite(mainPriceValue) && mainPriceValue > 0;
  const propertyPriceAmount = hasValidNumericPrice ? mainPriceValue : null;
  const propertyPublicId = property.public_id ?? property.listing_id ?? "";
  const formattedMainPrice = formatCurrency(hasValidNumericPrice ? mainPriceValue : property.price);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogo={false} />
      <div>
        <DetailMediaCarousel
          media={property.media}
          title={property.title || ""}
          onImageClick={() => setShowGallery(true)}
          onBack={() => router.back()}
        />

        <div className="relative mx-auto w-full max-w-7xl px-0 sm:px-4">
          <div className="absolute right-0 -top-[80px] z-20 w-[360px] max-w-[calc(50%-1rem)] hidden xl:block">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 m-0 p-0" id="contact-form">
              <ContactForm
                propertyId={property.public_id || property.listing_id || ""}
                propertyPublicId={propertyPublicId}
                propertyUrl={pageUrl ?? undefined}
                propertyPrice={propertyPriceAmount}
                dealType={dealType}
              />
            </div>
          </div>

          <div className="py-6 xl:pr-[420px]">
            <div className="   p-6 mb-6">
              <div className="text-sm text-gray-600 mb-4">
                {breadcrumbs.join(" / ")}
              </div>

              {property.property_type === "apartment" && property.condominium_id && (
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                  <Building size={18} className="text-primary" />
                  <span>Condomínio: </span>
                  <a href={`/condominiums/${property.condominium_id}`} className="text-primary hover:underline">
                    {condominiumInfo?.name || "Ver condomínio"}
                  </a>
                </div>
              )}

              <div >
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">
                    {property.forRent ? "Valor de Aluguel" : "Valor de Venda"}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {formattedMainPrice}
                  </div>
                </div>

                {(property.property_administration_fee_amount || property.iptu_amount || property.spu) && (
                  <div className="flex flex-wrap gap-4">
                    {property.property_administration_fee_amount && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-sm text-gray-600 mb-0.5">Condomínio</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(property.property_administration_fee_amount)}
                        </div>
                        {(property && "property_administration_fee_period" in property ? (property as PropertyCardType & { property_administration_fee_period?: string }).property_administration_fee_period : null) && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {translatePeriod((property as PropertyCardType & { property_administration_fee_period?: string }).property_administration_fee_period!)}
                          </div>
                        )}
                      </div>
                    )}

                    {property.iptu_amount && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-sm text-gray-600 mb-0.5">IPTU</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(property.iptu_amount)}
                        </div>
                        {property.iptu_period && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {translatePeriod(property.iptu_period)}
                          </div>
                        )}
                      </div>
                    )}

                    {property.spu && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-sm text-gray-600 mb-0.5">SPU</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(Number(property.spu))}
                        </div>
                        {(property && "spu_period" in property ? (property as PropertyCardType & { spu_period?: string }).spu_period : null) && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {translatePeriod((property as PropertyCardType & { spu_period?: string }).spu_period!)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <MapPin size={20} className="text-primary" />
                  Localização
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>{property.display_address || "Endereço não informado"}</p>
                  {property.postal_code && <p>CEP: {property.postal_code}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {property.area && property.area > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Ruler size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.area} m²</div>
                        <div className="text-sm text-gray-500">Área</div>
                      </div>
                    </div>
                  )}
                  {property.bedroom_count && property.bedroom_count > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Bed size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.bedroom_count}</div>
                        <div className="text-sm text-gray-500">Dormitórios</div>
                      </div>
                    </div>
                  )}
                  {property.bathroom_count && property.bathroom_count > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Bath size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.bathroom_count}</div>
                        <div className="text-sm text-gray-500">Banheiros</div>
                      </div>
                    </div>
                  )}
                  {property.garage_count && property.garage_count > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Car size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.garage_count}</div>
                        <div className="text-sm text-gray-500">Garagem</div>
                      </div>
                    </div>
                  )}
                  {property.suite_count && property.suite_count > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Home size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.suite_count}</div>
                        <div className="text-sm text-gray-500">Suítes</div>
                      </div>
                    </div>
                  )}
                  {property.year_built && property.year_built > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.year_built}</div>
                        <div className="text-sm text-gray-500">Ano</div>
                      </div>
                    </div>
                  )}
                  {property.built_area && property.built_area > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Layers size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.built_area} m²</div>
                        <div className="text-sm text-gray-500">Área Construída</div>
                      </div>
                    </div>
                  )}
                  {property.land_area && property.land_area > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Sprout size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.land_area} m²</div>
                        <div className="text-sm text-gray-500">Área do Terreno</div>
                      </div>
                    </div>
                  )}
                  {property.private_area && property.private_area > 0 && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Home size={24} className="text-primary" />
                      <div>
                        <div className="font-bold text-lg">{property.private_area} m²</div>
                        <div className="text-sm text-gray-500">Área Privativa</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                if (!resolvedFeatures) {
                  return null;
                }

                const othersLabelRaw = resolvedFeatures["others_label"];
                const othersLabel = typeof othersLabelRaw === "string" ? othersLabelRaw : null;

                const activeFeatures = Object.entries(resolvedFeatures)
                  .filter(([_, v]) => v === true)
                  .map(([k]) => k)
                  .filter(k =>
                    k !== "others_label" &&
                    k !== "listing_id" &&
                    k !== "condominium_id" &&
                    k !== "entity_type" &&
                    k !== "id" &&
                    k !== "club_id" &&
                    k !== "created_by" &&
                    typeof k === "string"
                  );

                if (othersLabel) {
                  activeFeatures.push("others_label");
                }

                if (activeFeatures.length === 0) {
                  return null;
                }

                return (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Building size={20} className="text-primary" />
                      Acomodações
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      {activeFeatures.map((key) => {
                        let label: string;
                        let IconComponent: React.ComponentType<{ size?: number; className?: string }>;

                        if (key === "others_label" && othersLabel) {
                          label = othersLabel;
                          IconComponent = MoreHorizontal;
                        } else {
                          const featureInfo = getFeatureInfo(key);
                          label = featureInfo.label;
                          IconComponent = featureInfo.icon;
                        }

                        return (
                          <div key={key} className="flex items-center gap-3 text-gray-700 break-words">
                            <IconComponent size={24} className="text-primary flex-shrink-0" />
                            <span className="text-sm sm:text-base">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {property.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{toSentenceCase(cleanHtmlText(property.title))}</h1>
                  <p className="text-gray-700 whitespace-pre-line break-words">{cleanHtmlText(property.description)}</p>
                </div>
              )}
              {!property.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h1 className="text-3xl font-bold text-gray-900">{toSentenceCase(cleanHtmlText(property.title))}</h1>
                </div>
              )}
            </div>
          </div>

          <div className="xl:hidden mb-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200" id="contact-form-mobile">
              <ContactForm
                propertyId={property.public_id || property.listing_id || ""}
                propertyPublicId={propertyPublicId}
                propertyUrl={pageUrl ?? undefined}
                propertyPrice={propertyPriceAmount}
                dealType={dealType}
              />
            </div>
          </div>

          {similarProperties.length > 0 && (
            <div className="mt-12 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Imóveis Similares
              </h2>
              <div className="space-y-4">
                {similarProperties.map((similarProperty) => (
                  <HorizontalPropertyCard
                    key={similarProperty.listing_id}
                    {...similarProperty}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showGallery && property && property.media && (
        <ImageGallery
          mediaItems={property.media.map(item => ({
            id: item.id || '',
            url: item.url,
            caption: item.caption,
            is_primary: item.is_primary
          }))}
          onClose={() => setShowGallery(false)}
        />
      )}

      <Footer />
    </div>
  );
} 