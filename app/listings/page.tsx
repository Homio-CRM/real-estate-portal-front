"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { X } from "lucide-react";
import Header from "../../components/Header";
import HorizontalPropertyCardSkeleton from "../../components/HorizontalPropertyCardSkeleton";
import ResultsFiltersSkeleton from "../../components/ResultsFiltersSkeleton";
import BackToSearchButton from "../../components/BackToSearchButton";
import { Skeleton } from "../../components/ui/skeleton";
import { fetchListings } from "../../lib/fetchListings";
import { fetchCondominiums } from "../../lib/fetchCondominiums";
import HorizontalPropertyCard from "../../components/HorizontalPropertyCard";
import HorizontalCondominiumCard from "../../components/HorizontalCondominiumCard";
import ResultsFilters from "../../components/ResultsFilters";
import LocationSearchField from "../../components/LocationSearchField";
import Footer from "../../components/Footer";
import { PropertyCard as PropertyCardType, CondominiumCard as CondominiumCardType } from "../../types/listings";
import { parseFiltersFromSearchParams, validateFilters, getTransactionType } from "../../lib/filters";
import { buildListingsUrl } from "../../lib/navigation";
import { getStateAbbreviationById } from "../../lib/brazilianStates";
import { translatePropertyType, getDBTypesForDisplayTypes } from "../../lib/propertyTypes";

const cityNameCache = new Map<number, { name: string; stateId: number }>();

async function getCityName(cityId: number): Promise<{ name: string; stateId: number } | null> {
  if (cityNameCache.has(cityId)) {
    return cityNameCache.get(cityId)!;
  }

  try {
    const response = await fetch(`/api/cities?id=${cityId}`);
    if (response.ok) {
      const city = await response.json();
      if (city) {
        const cityInfo = {
          name: city.name,
          stateId: city.state_id
        };
        cityNameCache.set(cityId, cityInfo);
        return cityInfo;
      }
    }
  } catch {
  }
  return null;
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  type ApiFiltersState = {
    tipo: string | string[];
    operacao: string;
    bairro: string;
    localizacao: string;
  };
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PropertyCardType[]>([]);
  const [condoResults, setCondoResults] = useState<CondominiumCardType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [apiFilters, setApiFilters] = useState<ApiFiltersState>({
    tipo: initialFilters.tipo,
    operacao: initialFilters.operacao,
    bairro: initialFilters.bairro ?? "",
    localizacao: initialFilters.localizacao ?? "",
  });

  const [clientFilters, setClientFilters] = useState({
    quartos: "",
    banheiros: "",
    vagas: "",
    precoMin: "",
    precoMax: "",
    areaMin: "",
    areaMax: "",
    anoMin: "",
    anoMax: "",
    caracteristicas: [] as string[],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const performSearch = useCallback((filtersToUse: { localizacao: string; operacao: string; tipo: string | string[]; bairro: string }) => {
    const validation = validateFilters(filtersToUse);
    if (!validation.isValid) {
      setLoading(false);
      setResults([]);
      setCondoResults([]);
      return;
    }

    if (filtersToUse.localizacao) {
      getCityName(Number(filtersToUse.localizacao)).then(cityInfo => {
        if (cityInfo) {
          const stateAbbreviation = getStateAbbreviationById(cityInfo.stateId) ?? "";
          const formattedLocation = stateAbbreviation ? `${cityInfo.name} - ${stateAbbreviation}` : cityInfo.name;
          setCurrentLocation(formattedLocation);
        }
      });
    } else {
      setCurrentLocation("");
    }

    const tiposArray = Array.isArray(filtersToUse.tipo)
      ? filtersToUse.tipo.filter((tipo) => tipo && tipo !== "")
      : filtersToUse.tipo
        ? [filtersToUse.tipo]
        : [];

    const isOnlyCondoSelection =
      tiposArray.length === 1 &&
      (tiposArray[0] === "Condomínio" || tiposArray[0] === "residential_condo");

    const transactionType = getTransactionType(filtersToUse.operacao);
    const tipoParam = tiposArray.length > 0 ? tiposArray : undefined;
    const bairroParam = filtersToUse.bairro && filtersToUse.bairro !== "" ? filtersToUse.bairro : undefined;

    const baseParams = {
      cityId: validation.cityId!,
      tipo: tipoParam,
      bairro: bairroParam,
    };

    setLoading(true);

    if (isOnlyCondoSelection) {
      fetchCondominiums({
        cityId: validation.cityId!,
        limit: 1000,
        offset: 0,
      })
        .then((condos) => {
          setCondoResults(condos);
          setResults([]);
          setLoading(false);
        })
        .catch(() => {
          setCondoResults([]);
          setResults([]);
          setLoading(false);
        });
      return;
    }

    if (transactionType === "all") {
      Promise.all([
        fetchListings({
          ...baseParams,
          transactionType: "sale",
          limit: 15,
          offset: 0,
        }),
        fetchListings({
          ...baseParams,
          transactionType: "rent",
          limit: 15,
          offset: 0,
        }),
      ])
        .then(([saleListings, rentListings]) => {
          const combinedListings = [...saleListings, ...rentListings];
          setResults(combinedListings);
          setCondoResults([]);
          setLoading(false);

          Promise.all([
            fetchListings({
              ...baseParams,
              transactionType: "sale",
              limit: 1000,
              offset: 0,
            }),
            fetchListings({
              ...baseParams,
              transactionType: "rent",
              limit: 1000,
              offset: 0,
            }),
          ])
            .then(([allSaleListings, allRentListings]) => {
              const completeListings = [...allSaleListings, ...allRentListings];
              setResults(completeListings);
            })
            .catch(() => {
            });
        })
        .catch(() => {
          setResults([]);
          setCondoResults([]);
          setLoading(false);
        });
    } else {
      const fetchParams = {
        ...baseParams,
        transactionType,
        limit: 15,
        offset: 0,
      };

      fetchListings(fetchParams)
        .then((listings) => {
          setResults(listings);
          setCondoResults([]);
          setLoading(false);

          fetchListings({
            ...baseParams,
            transactionType,
            limit: 1000,
            offset: 0,
          })
            .then((allListings) => {
              setResults(allListings);
            })
            .catch(() => {
            });
        })
        .catch(() => {
          setResults([]);
          setCondoResults([]);
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    const newApiFilters = {
      tipo: initialFilters.tipo,
      operacao: initialFilters.operacao,
      bairro: initialFilters.bairro ?? "",
      localizacao: initialFilters.localizacao ?? "",
    };
    setApiFilters(newApiFilters);

    setResults([]);
    setCondoResults([]);
    setLoading(true);

    const filters = {
      localizacao: initialFilters.localizacao ?? "",
      operacao: initialFilters.operacao,
      tipo: initialFilters.tipo,
      bairro: initialFilters.bairro || "",
    };

    performSearch(filters);
  }, [
    initialFilters.localizacao,
    initialFilters.operacao,
    Array.isArray(initialFilters.tipo) ? initialFilters.tipo.join(",") : initialFilters.tipo,
    initialFilters.bairro,
    performSearch,
  ]);

  const handleApiFilterChange = (key: string, value: string | string[]) => {
    let processedValue: string | string[] = value;

    if (key === "tipo") {
      if (Array.isArray(value)) {
        processedValue = value;
      } else if (value) {
        processedValue = [value];
      } else {
        processedValue = [];
      }
    }

    const newApiFilters = { ...apiFilters, [key]: processedValue };
    setApiFilters(newApiFilters);

    const urlFilters: Record<string, string | string[]> = {};

    if (newApiFilters.localizacao) {
      urlFilters.localizacao = newApiFilters.localizacao;
    }

    if (key === "operacao") {
      urlFilters.operacao = (processedValue as string) || "todos";
    } else if (newApiFilters.operacao !== undefined && newApiFilters.operacao !== null) {
      urlFilters.operacao = newApiFilters.operacao || "todos";
    } else if (initialFilters.operacao) {
      urlFilters.operacao = initialFilters.operacao;
    }

    Object.entries(newApiFilters).forEach(([filterKey, filterValue]) => {
      if (filterKey === "localizacao" || filterKey === "operacao") {
        return;
      }

      if (Array.isArray(filterValue)) {
        if (filterValue.length > 0) {
          urlFilters[filterKey] = filterValue;
        }
      } else if (filterValue) {
        urlFilters[filterKey] = filterValue;
      }
    });

    Object.entries(initialFilters).forEach(([filterKey, filterValue]) => {
      if (urlFilters[filterKey] !== undefined) {
        return;
      }
      if (filterKey === "localizacao" || filterKey === "operacao") {
        return;
      }
      if (!filterValue) {
        return;
      }
      if (filterKey === "tipo") {
        const tiposArray = Array.isArray(filterValue) ? filterValue : [filterValue];
        if (tiposArray.length > 0 && tiposArray[0] !== "") {
          urlFilters[filterKey] = tiposArray;
        }
      } else {
        urlFilters[filterKey] = filterValue as string;
      }
    });

    const newUrl = buildListingsUrl(urlFilters);
    router.push(newUrl);
  };

  const handleClientFilterChange = (key: string, value: string | string[]) => {
    setClientFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    const clearedApiFilters = {
      tipo: "",
      operacao: "",
      bairro: "",
      localizacao: "",
    };

    setApiFilters(clearedApiFilters);
    setClientFilters({
      quartos: "",
      banheiros: "",
      vagas: "",
      precoMin: "",
      precoMax: "",
      areaMin: "",
      areaMax: "",
      anoMin: "",
      anoMax: "",
      caracteristicas: [],
    });

    const urlFilters: Record<string, string> = {};

    Object.entries(initialFilters).forEach(([key, value]) => {
      if (!value || value === "" || key === "tipo" || key === "operacao" || key === "bairro") {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          urlFilters[key] = value.join(",");
        }
      } else {
        urlFilters[key] = value;
      }
    });

    const newUrl = buildListingsUrl(urlFilters);
    router.push(newUrl);
  };

  const selectedTipos = useMemo(() => {
    return Array.isArray(apiFilters.tipo)
      ? apiFilters.tipo.filter((tipo) => tipo && tipo !== "")
      : apiFilters.tipo
        ? [apiFilters.tipo]
        : [];
  }, [apiFilters.tipo]);

  const selectedTipoDbValues = useMemo(() => {
    return selectedTipos.length > 0 ? getDBTypesForDisplayTypes(selectedTipos) : [];
  }, [selectedTipos]);

  const locationSearchTipo = useMemo(() => {
    return Array.isArray(initialFilters.tipo)
      ? initialFilters.tipo[0] ?? ""
      : initialFilters.tipo ?? "";
  }, [initialFilters.tipo]);

  const filteredResults = useMemo(() => {
    return results.filter(property => {
      if (clientFilters.quartos && clientFilters.quartos !== "") {
        const quartos = parseInt(clientFilters.quartos);
        if (clientFilters.quartos === "5+" && (property.bedroom_count || 0) < 5) return false;
        if (clientFilters.quartos !== "5+" && property.bedroom_count !== quartos) return false;
      }

      if (clientFilters.banheiros && clientFilters.banheiros !== "") {
        const banheiros = parseInt(clientFilters.banheiros);
        if (clientFilters.banheiros === "5+" && (property.bathroom_count || 0) < 5) return false;
        if (clientFilters.banheiros !== "5+" && property.bathroom_count !== banheiros) return false;
      }

      if (clientFilters.vagas && clientFilters.vagas !== "") {
        const vagas = parseInt(clientFilters.vagas);
        if (clientFilters.vagas === "5+" && (property.garage_count || 0) < 5) return false;
        if (clientFilters.vagas !== "5+" && property.garage_count !== vagas) return false;
      }

      if (clientFilters.precoMin && clientFilters.precoMin !== "") {
        const precoMin = parseFloat(clientFilters.precoMin);
        if (precoMin > 0) {
          let propertyPrice = 0;
          if (property.list_price_amount) {
            propertyPrice = property.list_price_amount;
          } else if (property.price && property.price !== "Preço sob consulta") {
            const priceMatch = property.price.match(/R\$\s*([\d.,]+)/);
            propertyPrice = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
          }
          if (!propertyPrice || propertyPrice < precoMin) return false;
        }
      }

      if (clientFilters.precoMax && clientFilters.precoMax !== "") {
        const precoMax = parseFloat(clientFilters.precoMax);
        if (precoMax > 0) {
          let propertyPrice = 0;
          if (property.list_price_amount) {
            propertyPrice = property.list_price_amount;
          } else if (property.price && property.price !== "Preço sob consulta") {
            const priceMatch = property.price.match(/R\$\s*([\d.,]+)/);
            propertyPrice = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
          }
          if (!propertyPrice || propertyPrice > precoMax) return false;
        }
      }

      if (clientFilters.areaMin && clientFilters.areaMin !== "") {
        const areaMin = parseFloat(clientFilters.areaMin);
        if (!property.area || property.area < areaMin) return false;
      }

      if (clientFilters.areaMax && clientFilters.areaMax !== "") {
        const areaMax = parseFloat(clientFilters.areaMax);
        if (!property.area || property.area > areaMax) return false;
      }

      if (clientFilters.anoMin && clientFilters.anoMin !== "") {
        const anoMin = parseInt(clientFilters.anoMin);
        if (!property.year_built || property.year_built < anoMin) return false;
      }

      if (clientFilters.anoMax && clientFilters.anoMax !== "") {
        const anoMax = parseInt(clientFilters.anoMax);
        if (!property.year_built || property.year_built > anoMax) return false;
      }

      if (clientFilters.caracteristicas.length > 0) {
        const hasAllFeatures = clientFilters.caracteristicas.every(feature => {
          const featureKey = feature.toLowerCase().replace(/\s+/g, '_');

          const propertyWithFeatures = property as PropertyCardType & { features?: unknown };
          let featuresObj: Record<string, unknown> | null = null;
          if (propertyWithFeatures.features) {
            if (typeof propertyWithFeatures.features === 'string') {
              try {
                const parsed = JSON.parse(propertyWithFeatures.features);
                featuresObj = typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
              } catch {
                featuresObj = null;
              }
            } else if (typeof propertyWithFeatures.features === 'object' && propertyWithFeatures.features !== null) {
              featuresObj = propertyWithFeatures.features as Record<string, unknown>;
            }
          }

          if (featuresObj && typeof featuresObj === 'object' && !Array.isArray(featuresObj)) {
            return featuresObj[featureKey] === true;
          }

          return false;
        });
        if (!hasAllFeatures) return false;
      }

      return true;
    });
  }, [
    results,
    clientFilters.quartos,
    clientFilters.banheiros,
    clientFilters.vagas,
    clientFilters.precoMin,
    clientFilters.precoMax,
    clientFilters.areaMin,
    clientFilters.areaMax,
    clientFilters.anoMin,
    clientFilters.anoMax,
    clientFilters.caracteristicas,
  ]);

  const displayTipo = apiFilters.tipo
    ? (Array.isArray(apiFilters.tipo)
      ? apiFilters.tipo.map(t => translatePropertyType(t))
      : translatePropertyType(apiFilters.tipo))
    : "";

  const combinedFilters = {
    ...apiFilters,
    tipo: displayTipo,
    ...clientFilters,
  };

  const RESULTS_PER_PAGE = 15;
  const initialTiposArray = useMemo(() => {
    return Array.isArray(initialFilters.tipo) ? initialFilters.tipo : (initialFilters.tipo ? [initialFilters.tipo] : []);
  }, [initialFilters.tipo]);

  const condoSelectedFromInitial = useMemo(() => {
    return initialTiposArray.includes("Condomínio") || initialTiposArray.includes("residential_condo");
  }, [initialTiposArray]);

  const isCondoFilter = useMemo(() => {
    return selectedTipos.length > 0
      ? selectedTipos.every((tipo) => tipo === "Condomínio" || tipo === "residential_condo")
      : condoSelectedFromInitial;
  }, [selectedTipos, condoSelectedFromInitial]);

  const filteredCondoResults = useMemo(() => {
    return condoResults.filter(condo => {
      if (apiFilters.localizacao && apiFilters.localizacao !== "") {
        const filterCityId = Number(apiFilters.localizacao);
        if (filterCityId && condo.city_id !== filterCityId) {
          return false;
        }
      }
      return true;
    });
  }, [condoResults, apiFilters.localizacao]);

  const totalResults = isCondoFilter ? filteredCondoResults.length : filteredResults.length;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const paginatedResults = isCondoFilter
    ? filteredCondoResults.slice(startIndex, endIndex)
    : filteredResults.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    Array.isArray(initialFilters.tipo) ? initialFilters.tipo.join(",") : initialFilters.tipo,
    initialFilters.operacao,
    initialFilters.localizacao,
    initialFilters.bairro
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogo={false} />
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <BackToSearchButton />
          {loading && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="hidden lg:block lg:w-96 lg:flex-shrink-0">
                <ResultsFiltersSkeleton />
              </div>

              <div className="flex-1 w-full">
                <Skeleton className="h-24 w-full mb-6 rounded-lg" />
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <HorizontalPropertyCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="hidden lg:block lg:w-96 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-8">
                  <ResultsFilters
                    filters={combinedFilters}
                    onFilterChange={(key: string, value: string | string[]) => {
                      if (key === "operacao" || key === "tipo") {
                        handleApiFilterChange(key, value as string);
                      } else {
                        handleClientFilterChange(key, value);
                      }
                    }}
                    onClearFilters={handleClearFilters}
                    onSearch={() => { }}
                  />
                </div>
              </div>

              <div className="flex-1 w-full">
                <LocationSearchField
                  currentLocation={currentLocation ? (initialFilters.bairro ? `${initialFilters.bairro}, ${currentLocation}` : currentLocation) : "Carregando..."}
                  currentFilters={{
                    operacao: initialFilters.operacao ?? "",
                    tipo: locationSearchTipo,
                    bairro: initialFilters.bairro ?? "",
                  }}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                />

                {(initialFilters.tipo === "Condomínio" ? filteredCondoResults.length === 0 : filteredResults.length === 0) ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-gray-600 font-medium">
                    Nenhum imóvel encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div>
                    <div className="pt-6 mb-6">
                      <div className="text-sm text-gray-600">
                        {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {initialFilters.tipo === "Condomínio"
                        ? paginatedResults.map((condo) => (
                          <HorizontalCondominiumCard key={(condo as CondominiumCardType).id} {...(condo as CondominiumCardType)} />
                        ))
                        : paginatedResults.map((property, idx) => (
                          <HorizontalPropertyCard key={(property as PropertyCardType).listing_id || idx} {...(property as PropertyCardType)} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Anterior
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-2 min-w-[40px] rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar filtros"
          />
          <div className="relative flex h-full w-11/12 max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-lg font-medium text-gray-900">Filtros</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ResultsFilters
                filters={combinedFilters}
                onFilterChange={(key: string, value: string | string[]) => {
                  if (key === "operacao" || key === "tipo") {
                    handleApiFilterChange(key, value as string);
                  } else {
                    handleClientFilterChange(key, value);
                  }
                }}
                onClearFilters={() => {
                  handleClearFilters();
                }}
                onSearch={() => { }}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Listings() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando imóveis...</p>
        </div>
      </div>
    </div>}>
      <ListingsContent />
    </Suspense>
  );
} 