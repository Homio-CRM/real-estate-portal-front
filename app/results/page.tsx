"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../../components/Header";
import PropertyCardSkeleton from "../../components/PropertyCardSkeleton";
import BackToSearchButton from "../../components/BackToSearchButton";
import { fetchListings } from "../../lib/fetchListings";
import { fetchCondominiums } from "../../lib/fetchCondominiums";
import HorizontalPropertyCard from "../../components/HorizontalPropertyCard";
import HorizontalCondominiumCard from "../../components/HorizontalCondominiumCard";
import ResultsFilters from "../../components/ResultsFilters";
import LocationSearchField from "../../components/LocationSearchField";
import { PropertyCard as PropertyCardType, CondominiumCard as CondominiumCardType } from "../../types/listings";
import { parseFiltersFromSearchParams, validateFilters, getTransactionType } from "../../lib/filters";
import { buildResultsUrl } from "../../lib/navigation";

function ResultadosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PropertyCardType[]>([]);
  const [condoResults, setCondoResults] = useState<CondominiumCardType[]>([]);

  // Filtros que disparam nova busca na API
  const [apiFilters, setApiFilters] = useState({
    tipo: initialFilters.tipo,
    operacao: initialFilters.operacao,
    bairro: initialFilters.bairro,
  });

  // Filtros que apenas filtram os resultados já carregados
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

  const fetchResults = async (currentApiFilters = apiFilters) => {
    setLoading(true);
    const validation = validateFilters(initialFilters);
    if (!validation.isValid) {
      setResults([]);
      setLoading(false);
      return;
    }

    const transactionType = getTransactionType(currentApiFilters.operacao || initialFilters.operacao);

    if (currentApiFilters.tipo === "Condomínio") {
      const cs = await fetchCondominiums({
        cityId: validation.cityId!,
        limit: 100,
        offset: 0,
      });
      setCondoResults(cs);
      setResults([]);
      setLoading(false);
      return;
    }

    const isLaunch = currentApiFilters.operacao === "lancamento";
    const listings = await fetchListings({
      cityId: validation.cityId!,
      transactionType,
      tipo: currentApiFilters.tipo ? (currentApiFilters.tipo as "Casa" | "Apartamento") : undefined,
      bairro: currentApiFilters.bairro,
      limit: 100,
      offset: 0,
      isLaunch: isLaunch,
    });
    setCondoResults([]);
    setResults(listings);
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [initialFilters]);

  const handleApiFilterChange = (key: string, value: string) => {
    const newApiFilters = { ...apiFilters, [key]: value };
    setApiFilters(newApiFilters);

    const mergedFilters = { ...initialFilters, ...newApiFilters };
    const urlFilters: Record<string, string> = {};
    Object.entries(mergedFilters).forEach(([filterKey, filterValue]) => {
      const normalizedValue = Array.isArray(filterValue) ? filterValue[0] || "" : (filterValue || "");
      if (normalizedValue && normalizedValue !== "") {
        urlFilters[filterKey] = normalizedValue;
      }
    });

    const newUrl = buildResultsUrl(urlFilters);
    router.push(newUrl);
  };

  const handleClientFilterChange = (key: string, value: string | string[]) => {
    setClientFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setApiFilters({
      tipo: "",
      operacao: "",
      bairro: "",
    });
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

    // Atualizar a URL removendo os filtros
    const urlFilters: Record<string, string> = {};

    // Copiar apenas filtros não vazios dos filtros iniciais
    Object.entries(initialFilters).forEach(([key, value]) => {
      const normalizedValue = Array.isArray(value) ? value[0] || "" : (value || "");
      if (normalizedValue && normalizedValue !== "" && key !== "tipo" && key !== "operacao" && key !== "bairro") {
        urlFilters[key] = normalizedValue;
      }
    });

    const newUrl = buildResultsUrl(urlFilters);
    router.push(newUrl);
  };

  const handleLocationChange = (location: string) => {
    handleApiFilterChange("bairro", location);
  };

  const filteredResults = results.filter(property => {
    // Aplicar filtros do cliente (sem fazer nova busca na API)
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

    // Filtro de preço melhorado
    if (clientFilters.precoMin && clientFilters.precoMin !== "") {
      const precoMin = parseFloat(clientFilters.precoMin);
      if (precoMin > 0) { // Só aplica se for um valor válido
        // Usar o valor numérico do preço se disponível, senão extrair do preço formatado
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
      if (precoMax > 0) { // Só aplica se for um valor válido
        // Usar o valor numérico do preço se disponível, senão extrair do preço formatado
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
        return property[featureKey as keyof typeof property] === true;
      });
      if (!hasAllFeatures) return false;
    }

    return true;
  });

  // Combina os filtros para passar para o componente ResultsFilters
  const combinedFilters = {
    ...apiFilters,
    ...clientFilters,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogo={false} />
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <BackToSearchButton />
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && (
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="sticky top-8">
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

              <div className="flex-1">
                <LocationSearchField
                  currentLocation={apiFilters.bairro || "Vitória - ES"}
                  currentFilters={{
                    operacao: apiFilters.operacao,
                    tipo: Array.isArray(apiFilters.tipo) ? apiFilters.tipo[0] || "" : (apiFilters.tipo || ""),
                    bairro: apiFilters.bairro || "",
                  }}
                />

                {(apiFilters.tipo === "Condomínio" ? condoResults.length === 0 : results.length === 0) ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-gray-600 font-medium">
                    Nenhum imóvel encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="text-sm text-gray-600">
                        {apiFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length} resultado{(apiFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length) !== 1 ? 's' : ''} encontrado{(apiFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length) !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {apiFilters.tipo === "Condomínio"
                        ? condoResults.map((condo) => (
                          <HorizontalCondominiumCard key={condo.id} {...condo} />
                        ))
                        : filteredResults.map((property, idx) => (
                          <HorizontalPropertyCard key={property.listing_id || idx} {...property} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Resultados() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    </div>}>
      <ResultadosContent />
    </Suspense>
  );
} 