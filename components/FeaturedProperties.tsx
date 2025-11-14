"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchListings } from "../lib/fetchListings";
import { PropertyCard } from "../types/listings";
import { Building, Home, ChevronLeft, ChevronRight, Camera, Ruler, Bed, Bath, Car, MapPin } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import { getStateAbbreviationById } from "../lib/brazilianStates";
import { translateRentalPeriod } from "../lib/rentalPeriod";
import { buildListingsUrl } from "../lib/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeaturedPropertiesProps {
  cityId?: number;
  initialSaleProperties?: PropertyCard[];
  initialRentProperties?: PropertyCard[];
  initialCityNames?: Record<number, string>;
  initialActiveTab?: "comprar" | "alugar";
  shouldRevalidate?: boolean;
  onDataLoaded?: (data: {
    saleProperties: PropertyCard[];
    rentProperties: PropertyCard[];
    cityNames: Record<number, string>;
    cityId: number;
    activeTab: "comprar" | "alugar";
    timestamp: number;
  }) => void;
  onActiveTabChange?: (tab: "comprar" | "alugar") => void;
}

type Slide = { url: string; isMore?: boolean; moreCount?: number };

const DEFAULT_CITY_ID = 3205309;

export default function FeaturedProperties({
  cityId,
  initialSaleProperties,
  initialRentProperties,
  initialCityNames,
  initialActiveTab,
  shouldRevalidate,
  onDataLoaded,
  onActiveTabChange,
}: FeaturedPropertiesProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"comprar" | "alugar">(initialActiveTab ?? "comprar");
  const [saleProperties, setSaleProperties] = useState<PropertyCard[]>(initialSaleProperties ?? []);
  const [rentProperties, setRentProperties] = useState<PropertyCard[]>(initialRentProperties ?? []);
  const [loading, setLoading] = useState(!(initialSaleProperties?.length || initialRentProperties?.length));
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState<Record<string, number>>({});
  const [cityNames, setCityNames] = useState<Record<number, string>>(initialCityNames ?? {});
  const activeTabRef = useRef<"comprar" | "alugar">(initialActiveTab ?? "comprar");
  const cityNamesRef = useRef<Record<number, string>>(initialCityNames ?? {});

  useEffect(() => {
    cityNamesRef.current = cityNames;
  }, [cityNames]);

  useEffect(() => {
    if (initialSaleProperties && initialSaleProperties.length > 0) {
      setSaleProperties(initialSaleProperties);
    }
  }, [initialSaleProperties]);

  useEffect(() => {
    if (initialRentProperties && initialRentProperties.length > 0) {
      setRentProperties(initialRentProperties);
    }
  }, [initialRentProperties]);

  useEffect(() => {
    if (initialCityNames) {
      setCityNames(initialCityNames);
      cityNamesRef.current = initialCityNames;
    }
  }, [initialCityNames]);

  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    onActiveTabChange?.(activeTab);
  }, [activeTab, onActiveTabChange]);

  const toSentenceCase = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const fetchCityName = async (cityId: number): Promise<string | null> => {
    if (cityNamesRef.current[cityId]) {
      return cityNamesRef.current[cityId];
    }

    try {
      const response = await fetch(`/api/cities?id=${cityId}`);
      if (response.ok) {
        const city = await response.json();
        if (city && city.name) {
          return city.name;
        }
      }
    } catch (error) {
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const targetCityId = cityId || DEFAULT_CITY_ID;
    const hasInitialData = Boolean(initialSaleProperties?.length || initialRentProperties?.length);
    const needsFetch = shouldRevalidate || !hasInitialData;

    if (!needsFetch) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchApartments = async () => {
      if (!hasInitialData) {
        setLoading(true);
      }
      setError(null);
      try {
        const saleResults = await fetchListings({
          cityId: targetCityId,
          transactionType: "sale",
          limit: 6,
          offset: 0,
        });

        const rentResults = await fetchListings({
          cityId: targetCityId,
          transactionType: "rent",
          limit: 6,
          offset: 0,
        });

        const sortedSaleResults = saleResults.sort((a, b) => {
          const priceA = a.list_price_amount || 0;
          const priceB = b.list_price_amount || 0;
          return priceB - priceA;
        });

        const limitedSale = sortedSaleResults.slice(0, 6);
        const limitedRent = rentResults.slice(0, 6);

        if (!isMounted) {
          return;
        }

        setSaleProperties(limitedSale);
        setRentProperties(limitedRent);

        const allCityIds = new Set<number>();
        [...limitedSale, ...limitedRent].forEach((property) => {
          if (property.city_id) {
            allCityIds.add(property.city_id);
          }
        });

        const cityPromises = Array.from(allCityIds).map(async (id) => {
          const cityName = await fetchCityName(id);
          return cityName ? { id, cityName } : null;
        });

        const cityResults = (await Promise.all(cityPromises)).filter(
          (item): item is { id: number; cityName: string } => item !== null
        );

        let mergedCityNames = cityNamesRef.current;

        if (cityResults.length > 0) {
          mergedCityNames = cityResults.reduce<Record<number, string>>((acc, item) => {
            acc[item.id] = item.cityName;
            return acc;
          }, { ...cityNamesRef.current });

          cityNamesRef.current = mergedCityNames;
          setCityNames(mergedCityNames);
        }

        onDataLoaded?.({
          saleProperties: limitedSale,
          rentProperties: limitedRent,
          cityNames: mergedCityNames,
          cityId: targetCityId,
          activeTab: activeTabRef.current,
          timestamp: Date.now(),
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError("Erro ao carregar imóveis em destaque");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchApartments();

    return () => {
      isMounted = false;
    };
  }, [cityId, shouldRevalidate, initialSaleProperties, initialRentProperties, onDataLoaded]);

  const currentProperties = activeTab === "comprar" ? saleProperties : rentProperties;

  const formatAddress = (property: PropertyCard): string => {
    const parts: string[] = [];

    if (property.neighborhood) {
      parts.push(toSentenceCase(property.neighborhood));
    }

    if (property.city_id) {
      const cityName = cityNames[property.city_id];
      if (cityName) {
        parts.push(toSentenceCase(cityName));
      }
    }

    if (property.state_id) {
      const stateAbbrev = getStateAbbreviationById(property.state_id);
      if (stateAbbrev) {
        parts.push(stateAbbrev.toUpperCase());
      }
    }

    return parts.length > 0 ? parts.join(", ") : "Endereço não informado";
  };

  const handlePropertyClick = (property: PropertyCard) => {
    if (property.listing_id) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`listing_${property.listing_id}`, JSON.stringify(property));
      }
      router.push(`/listings/${property.listing_id}`);
    }
  };

  const getPropertyImages = (property: PropertyCard): string[] => {
    const fromMedia =
      property.media && property.media.length > 0
        ? property.media.map((m) => m.url).filter((u): u is string => !!u)
        : [];
    const fallback = property.image ? [property.image] : [];
    const imgs = fromMedia.length ? fromMedia : fallback;
    return Array.from(new Set(imgs));
  };

  const buildSlides = (property: PropertyCard): Slide[] => {
    const imgs = getPropertyImages(property);
    if (imgs.length === 0) {
      return [{ url: "" }];
    }

    if (imgs.length <= 4) {
      return imgs.map((url) => ({ url }));
    }

    const first4 = imgs.slice(0, 4).map((url) => ({ url }));
    const more = imgs.length - 4;
    const bg = imgs[4] || imgs[0];
    return [...first4, { url: bg, isMore: true, moreCount: more }];
  };

  const prevSlide = (property: PropertyCard) => {
    const id = String(property.listing_id || property.title);
    const slides = buildSlides(property);
    setCurrentIdx((s) => {
      const curr = s[id] ?? 0;
      const next = curr === 0 ? 0 : curr - 1;
      return { ...s, [id]: next };
    });
  };

  const nextSlide = (property: PropertyCard) => {
    const id = String(property.listing_id || property.title);
    const slides = buildSlides(property);
    setCurrentIdx((s) => {
      const curr = s[id] ?? 0;
      const next = curr === slides.length - 1 ? slides.length - 1 : curr + 1;
      return { ...s, [id]: next };
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Imóveis em Destaque</h2>
            <p className="text-gray-600">Descubra os melhores imóveis da região</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || (saleProperties.length === 0 && rentProperties.length === 0)) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Imóveis em Destaque</h2>
          <p className="text-gray-600 text-lg">
            {activeTab === "comprar" ? "Os imóveis mais exclusivos para compra" : "Os melhores imóveis para aluguel"}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab("comprar")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === "comprar" ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Comprar
            </button>
            <button
              onClick={() => setActiveTab("alugar")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === "alugar" ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Alugar
            </button>
          </div>
        </div>

        {currentProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProperties.map((property) => {
                const slides = buildSlides(property);
                const id = String(property.listing_id || property.title);
                const idx = currentIdx[id] ?? 0;

                return (
                  <div
                    key={property.listing_id ?? property.title}
                    className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="relative h-56 md:h-60 bg-gray-200 overflow-hidden">
                      <div
                        className="flex h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${idx * 100}%)` }}
                      >
                        {slides.map((slide, slideIdx) => (
                          <div
                            key={slideIdx}
                            className="relative flex-none min-w-full w-full h-full overflow-hidden"
                          >
                            {slide.url && slide.url.trim() !== "" ? (
                              <img
                                src={slide.url}
                                alt={`${property.title} - Imagem ${slideIdx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`${slide.url && slide.url.trim() !== "" ? 'hidden' : ''} absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400`}>
                              <Camera size={48} className="mb-2" />
                              <span className="text-sm">Sem imagem</span>
                            </div>

                            {slide.isMore && (
                              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center">
                                <Camera size={28} className="text-white mb-2" />
                                <span className="text-white text-lg font-semibold">
                                  +{slide.moreCount} fotos
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {slides.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevSlide(property);
                            }}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full border transition-all ${idx === 0
                              ? "bg-black/30 text-white/60 cursor-not-allowed border-transparent"
                              : "bg-black/60 text-white border-black/50 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                              }`}
                            aria-label="Anterior"
                            disabled={idx === 0}
                          >
                            <ChevronLeft size={18} strokeWidth={3} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextSlide(property);
                            }}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full border transition-all ${idx === slides.length - 1
                              ? "bg-black/30 text-white/60 cursor-not-allowed border-transparent"
                              : "bg-black/60 text-white border-black/50 hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                              }`}
                            aria-label="Próximo"
                            disabled={idx === slides.length - 1}
                          >
                            <ChevronRight size={18} strokeWidth={3} />
                          </button>
                        </>
                      )}

                      {slides.length > 1 && (
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                            {idx + 1}/{slides.length}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col min-h-[200px]">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mb-3 line-clamp-1">
                          <MapPin size={14} />
                          <span>{formatAddress(property)}</span>
                        </div>

                        <div className="mb-3">
                          {activeTab === "alugar" && property.rental_price_amount ? (
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(property.rental_price_amount)}
                              {property.rental_period && (
                                <> /{translateRentalPeriod(property.rental_period)}</>
                              )}
                            </p>
                          ) : (
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(property.list_price_amount || property.price)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {property.area && property.area > 0 && (
                            <div className="flex items-center gap-1">
                              <Ruler size={14} />
                              <span>{property.area}m²</span>
                            </div>
                          )}
                          {property.bedroom_count != null && property.bedroom_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed size={14} />
                              <span>{property.bedroom_count}</span>
                            </div>
                          )}
                          {property.bathroom_count != null && property.bathroom_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath size={14} />
                              <span>{property.bathroom_count}</span>
                            </div>
                          )}
                          {property.garage_count != null && property.garage_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Car size={14} />
                              <span>{property.garage_count}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handlePropertyClick(property)}
                        className="w-full mt-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href={buildListingsUrl({ operacao: activeTab, localizacao: String(cityId || 3205309) })}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-secondary transition-colors"
              >
                Ver Todos os Imóveis
                <ArrowRight size={20} />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
