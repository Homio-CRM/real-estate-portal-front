"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { X } from "lucide-react";
import Header from "../../components/Header";
import HorizontalPropertyCardSkeleton from "../../components/HorizontalPropertyCardSkeleton";
import ResultsFiltersSkeleton from "../../components/ResultsFiltersSkeleton";
import BackToSearchButton from "../../components/BackToSearchButton";
import { Skeleton } from "../../components/ui/skeleton";
import { fetchFeaturedCondominiums } from "../../lib/fetchFeaturedCondominiums";
import HorizontalCondominiumCard from "../../components/HorizontalCondominiumCard";
import ResultsFilters from "../../components/ResultsFilters";
import LocationSearchField from "../../components/LocationSearchField";
import Footer from "../../components/Footer";
import { CondominiumCard as CondominiumCardType } from "../../types/listings";
import { parseFiltersFromSearchParams } from "../../lib/filters";
import { buildLaunchesUrl } from "../../lib/navigation";
import { getStateAbbreviationById } from "../../lib/brazilianStates";

async function getCityName(cityId: number): Promise<{ name: string; stateId: number } | null> {
  try {
    const response = await fetch(`/api/cities?id=${cityId}`);
    if (response.ok) {
      const city = await response.json();
      if (city) {
        return {
          name: city.name,
          stateId: city.state_id
        };
      }
    }
  } catch {
  }
  return null;
}

type ApiFiltersState = {
  tipo: string | string[];
  operacao: string;
  bairro: string;
  localizacao: string;
};

function LaunchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilters = useMemo(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    return {
      ...parsed,
      operacao: "lancamento",
    };
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [launchResults, setLaunchResults] = useState<CondominiumCardType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [apiFilters, setApiFilters] = useState<ApiFiltersState>({
    tipo: initialFilters.tipo,
    operacao: "lancamento",
    bairro: initialFilters.bairro || "",
    localizacao: initialFilters.localizacao,
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

  const performSearch = useCallback((filtersToUse: { localizacao: string; bairro: string }) => {
    const cityId = Number(filtersToUse.localizacao);

    if (!Number.isFinite(cityId) || cityId <= 0) {
      setCurrentLocation("");
      setLaunchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    getCityName(cityId)
      .then(cityInfo => {
        if (cityInfo) {
          const stateAbbreviation = getStateAbbreviationById(cityInfo.stateId);
          setCurrentLocation(`${cityInfo.name} - ${stateAbbreviation}`);
        } else {
          setCurrentLocation("");
        }
      })
      .catch(() => {
        setCurrentLocation("");
      });

    fetchFeaturedCondominiums({
      cityId,
      limit: 1000,
      offset: 0,
      strictCityFilter: true,
    })
      .then((launches) => {
        const filtered = filtersToUse.bairro
          ? launches.filter((launch) => {
              const neighborhood = launch.neighborhood?.toLowerCase() || "";
              return neighborhood.includes(filtersToUse.bairro.toLowerCase());
            })
          : launches;
        
        setLaunchResults(filtered);
      })
      .catch(() => {
        setLaunchResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLaunchResults([]);
    setLoading(true);
    
    performSearch({
      localizacao: initialFilters.localizacao,
      bairro: initialFilters.bairro || "",
    });
  }, [
    initialFilters.localizacao,
    initialFilters.bairro,
    performSearch,
  ]);

  useEffect(() => {
    setApiFilters({
      tipo: initialFilters.tipo,
      operacao: "lancamento",
      bairro: initialFilters.bairro || "",
      localizacao: initialFilters.localizacao,
    });
  }, [
    initialFilters.tipo,
    initialFilters.bairro,
    initialFilters.localizacao,
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

    Object.entries(newApiFilters).forEach(([filterKey, filterValue]) => {
      if (filterKey === "operacao" || filterKey === "localizacao") {
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
      if (filterKey === "operacao" || filterKey === "localizacao") {
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

    const newUrl = buildLaunchesUrl(urlFilters);
    router.push(newUrl);
  };

  const handleClientFilterChange = (key: string, value: string | string[]) => {
    setClientFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    const clearedApiFilters: ApiFiltersState = {
      tipo: "",
      operacao: "lancamento",
      bairro: "",
      localizacao: initialFilters.localizacao,
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

    if (initialFilters.localizacao) {
      urlFilters.localizacao = initialFilters.localizacao;
    }

    const newUrl = buildLaunchesUrl(urlFilters);
    router.push(newUrl);
  };

  const selectedTipos = Array.isArray(apiFilters.tipo)
    ? apiFilters.tipo.filter((tipo) => tipo && tipo !== "")
    : apiFilters.tipo
      ? [apiFilters.tipo]
      : [];

  const filterByRange = (min: number | null | undefined, max: number | null | undefined, target: number) => {
    if (min !== null && min !== undefined && target < min) {
      return false;
    }
    if (max !== null && max !== undefined && target > max) {
      return false;
    }
    if (min === null && max === null) {
      return false;
    }
    return true;
  };

  const filteredResults = launchResults.filter((condo) => {
    if (apiFilters.localizacao && apiFilters.localizacao !== "") {
      const filterCityId = Number(apiFilters.localizacao);
      if (filterCityId && condo.city_id !== filterCityId) {
        return false;
      }
    }

    if (apiFilters.bairro && apiFilters.bairro !== "") {
      const condoNeighborhood = condo.neighborhood || condo.display_address || "";
      if (!condoNeighborhood || condoNeighborhood.toLowerCase() !== apiFilters.bairro.toLowerCase()) {
        return false;
      }
    }

    if (clientFilters.quartos && clientFilters.quartos !== "") {
      const minRooms = condo.min_room_amount ?? null;
      const maxRooms = condo.max_room_amount ?? null;
      if (clientFilters.quartos === "5+") {
        if ((maxRooms ?? minRooms ?? 0) < 5) {
          return false;
        }
      } else {
        const targetRooms = parseInt(clientFilters.quartos, 10);
        if (Number.isNaN(targetRooms) || !filterByRange(minRooms, maxRooms, targetRooms)) {
          return false;
        }
      }
    }

    if (clientFilters.banheiros && clientFilters.banheiros !== "") {
      const minBaths = condo.min_bathroom_count ?? null;
      const maxBaths = condo.max_bathroom_count ?? null;
      if (clientFilters.banheiros === "5+") {
        if ((maxBaths ?? minBaths ?? 0) < 5) {
          return false;
        }
      } else {
        const targetBaths = parseInt(clientFilters.banheiros, 10);
        if (Number.isNaN(targetBaths) || !filterByRange(minBaths, maxBaths, targetBaths)) {
          return false;
        }
      }
    }

    if (clientFilters.vagas && clientFilters.vagas !== "") {
      const minGarages = condo.min_garage_count ?? null;
      const maxGarages = condo.max_garage_count ?? null;
      if (clientFilters.vagas === "5+") {
        if ((maxGarages ?? minGarages ?? 0) < 5) {
          return false;
        }
      } else {
        const targetGarages = parseInt(clientFilters.vagas, 10);
        if (Number.isNaN(targetGarages) || !filterByRange(minGarages, maxGarages, targetGarages)) {
          return false;
        }
      }
    }

    if (clientFilters.precoMin && clientFilters.precoMin !== "") {
      const precoMin = parseFloat(clientFilters.precoMin);
      if (precoMin > 0) {
        const maxPrice = condo.max_price ?? condo.min_price ?? null;
        if (!maxPrice || maxPrice < precoMin) {
          return false;
        }
      }
    }

    if (clientFilters.precoMax && clientFilters.precoMax !== "") {
      const precoMax = parseFloat(clientFilters.precoMax);
      if (precoMax > 0) {
        const minPrice = condo.min_price ?? condo.max_price ?? null;
        if (!minPrice || minPrice > precoMax) {
          return false;
        }
      }
    }

    if (clientFilters.areaMin && clientFilters.areaMin !== "") {
      const areaMin = parseFloat(clientFilters.areaMin);
      const maxArea = condo.max_area ?? condo.min_area ?? null;
      if (!maxArea || maxArea < areaMin) return false;
    }

    if (clientFilters.areaMax && clientFilters.areaMax !== "") {
      const areaMax = parseFloat(clientFilters.areaMax);
      const minArea = condo.min_area ?? condo.max_area ?? null;
      if (!minArea || minArea > areaMax) return false;
    }

    if (clientFilters.anoMin && clientFilters.anoMin !== "") {
      const anoMin = parseInt(clientFilters.anoMin, 10);
      const year = typeof condo.year_built === "number"
        ? condo.year_built
        : typeof condo.delivery_forecast === "number"
          ? condo.delivery_forecast
          : Number.parseInt(String(condo.delivery_forecast || ""), 10);
      if (!year || year < anoMin) return false;
    }

    if (clientFilters.anoMax && clientFilters.anoMax !== "") {
      const anoMax = parseInt(clientFilters.anoMax, 10);
      const year = typeof condo.year_built === "number"
        ? condo.year_built
        : typeof condo.delivery_forecast === "number"
          ? condo.delivery_forecast
          : Number.parseInt(String(condo.delivery_forecast || ""), 10);
      if (!year || year > anoMax) return false;
    }

    if (clientFilters.caracteristicas.length > 0) {
      const hasAllFeatures = clientFilters.caracteristicas.every(feature => {
        const featureKey = feature.toLowerCase().replace(/\s+/g, '_');

        const condoWithFeatures = condo as CondominiumCardType & { features?: unknown };
        let featuresObj: Record<string, unknown> | null = null;
        if (condoWithFeatures.features) {
          if (typeof condoWithFeatures.features === 'string') {
            try {
              const parsed = JSON.parse(condoWithFeatures.features);
              featuresObj = typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null;
            } catch {
              featuresObj = null;
            }
          } else if (typeof condoWithFeatures.features === 'object' && condoWithFeatures.features !== null) {
            featuresObj = condoWithFeatures.features as Record<string, unknown>;
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

  const combinedFilters = {
    ...apiFilters,
    operacao: "lancamento",
    tipo: selectedTipos,
    ...clientFilters,
  };

  const RESULTS_PER_PAGE = 15;
  const totalResults = filteredResults.length;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    initialFilters.localizacao,
    initialFilters.bairro,
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
                      if (key === "operacao" || key === "tipo" || key === "bairro") {
                        handleApiFilterChange(key, value);
                      } else {
                        handleClientFilterChange(key, value);
                      }
                    }}
                    onClearFilters={handleClearFilters}
                    onSearch={() => {}}
                  />
                </div>
              </div>

              <div className="flex-1 w-full">
                <LocationSearchField
                  currentLocation={currentLocation ? (initialFilters.bairro ? `${initialFilters.bairro}, ${currentLocation}` : currentLocation) : "Carregando..."}
                  currentFilters={{
                    operacao: "lancamento",
                    tipo: Array.isArray(initialFilters.tipo) ? initialFilters.tipo[0] || "" : (initialFilters.tipo || ""),
                    bairro: initialFilters.bairro || "",
                  }}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                />

                {filteredResults.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-gray-600 font-medium">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div>
                    <div className="pt-6 mb-6">
                      <div className="text-sm text-gray-600">
                        {totalResults} lançamento{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {paginatedResults.map((condo) => (
                        <HorizontalCondominiumCard key={(condo as CondominiumCardType).id} {...(condo as CondominiumCardType)} />
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
                  if (key === "operacao" || key === "tipo" || key === "bairro") {
                    handleApiFilterChange(key, value);
                  } else {
                    handleClientFilterChange(key, value);
                  }
                }}
                onClearFilters={() => {
                  handleClearFilters();
                }}
                onSearch={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Launches() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lançamentos...</p>
        </div>
      </div>
    </div>}>
      <LaunchesContent />
    </Suspense>
  );
}

