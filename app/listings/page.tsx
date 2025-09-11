"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../../components/Header";
import ListingsSkeleton from "../../components/ListingsSkeleton";
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
import { Button } from "../../components/ui/button";

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
  } catch (error) {
    console.error("Error fetching city name:", error);
  }
  return null;
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PropertyCardType[]>([]);
  const [condoResults, setCondoResults] = useState<CondominiumCardType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filtros que disparam nova busca na API
  const [apiFilters, setApiFilters] = useState({
    tipo: initialFilters.tipo,
    operacao: initialFilters.operacao,
    bairro: initialFilters.bairro,
    localizacao: initialFilters.localizacao,
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

  // Remover o useEffect duplicado que estava causando loop
  // useEffect(() => {
  //   console.log("=== useEffect apiFilters ===");
  //   console.log("apiFilters changed:", {
  //     localizacao: apiFilters.localizacao,
  //     operacao: apiFilters.operacao,
  //     tipo: apiFilters.tipo,
  //     bairro: apiFilters.bairro
  //   });
  //   fetchResults();
  // }, [apiFilters.localizacao, apiFilters.operacao, apiFilters.tipo, apiFilters.bairro]);

  // Removido useEffect inicial - agora tudo é tratado pelo useEffect que monitora URL

  // Monitorar mudanças na URL e fazer busca
  useEffect(() => {
    // Fazer a busca com os filtros da URL
    const effectiveFilters = {
      localizacao: initialFilters.localizacao,
      operacao: initialFilters.operacao,
      tipo: initialFilters.tipo,
      bairro: initialFilters.bairro,
    };
    
    const validation = validateFilters(effectiveFilters);
    if (validation.isValid) {
      // Atualizar o currentLocation imediatamente, independente do tipo de busca
      if (effectiveFilters.localizacao) {
        getCityName(Number(effectiveFilters.localizacao)).then(cityInfo => {
          if (cityInfo) {
            const stateAbbreviation = getStateAbbreviationById(cityInfo.stateId);
            setCurrentLocation(`${cityInfo.name} - ${stateAbbreviation}`);
          }
        });
      } else {
        setCurrentLocation("");
      }

      const transactionType = getTransactionType(effectiveFilters.operacao);
      const isCondo = effectiveFilters.tipo === "Condomínio";
      
      if (isCondo) {
        setLoading(true);
        fetchCondominiums({
          cityId: validation.cityId!,
          limit: 100,
          offset: 0,
        }).then(cs => {
          setCondoResults(cs);
          setResults([]);
          setLoading(false);
        });
      } else if (transactionType === "all") {
        // Buscar imóveis de venda e aluguel
        setLoading(true);
        
        Promise.all([
          fetchListings({
            cityId: validation.cityId!,
            transactionType: "sale",
            tipo: effectiveFilters.tipo ? (effectiveFilters.tipo as "Casa" | "Apartamento") : undefined,
            bairro: effectiveFilters.bairro,
            limit: 50,
            offset: 0,
          }),
          fetchListings({
            cityId: validation.cityId!,
            transactionType: "rent",
            tipo: effectiveFilters.tipo ? (effectiveFilters.tipo as "Casa" | "Apartamento") : undefined,
            bairro: effectiveFilters.bairro,
            limit: 50,
            offset: 0,
          })
        ]).then(([saleListings, rentListings]) => {
          const allListings = [...saleListings, ...rentListings];
          setCondoResults([]);
          setResults(allListings);
          setLoading(false);
        });
      } else {
        // Buscar apenas um tipo de transação
        const fetchParams = {
          cityId: validation.cityId!,
          transactionType,
          tipo: effectiveFilters.tipo ? (effectiveFilters.tipo as "Casa" | "Apartamento") : undefined,
          bairro: effectiveFilters.bairro,
          limit: 100,
          offset: 0,
        };
        
        setLoading(true);
        fetchListings(fetchParams).then(listings => {
          setCondoResults([]);
          setResults(listings);
          setLoading(false);
        });
      }
    }
  }, [initialFilters]);

  // Removido useEffects duplicados - agora o currentLocation é atualizado diretamente no evento

  const handleApiFilterChange = (key: string, value: string) => {
    const newApiFilters = { ...apiFilters, [key]: value };
    
    setApiFilters(newApiFilters);
    
    // Atualizar a URL com os novos filtros
    const urlFilters: Record<string, string> = {};
    
    // Copiar filtros iniciais (exceto o que está sendo alterado)
    Object.entries(initialFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== "" && filterKey !== key) {
        urlFilters[filterKey] = filterValue;
      }
    });
    
    // Adicionar o novo valor do filtro sendo alterado
    if (value && value !== "") {
      urlFilters[key] = value;
    }
    
    const newUrl = buildListingsUrl(urlFilters);
    
    // Apenas navegar - o useEffect vai detectar a mudança na URL
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
    
    // Atualizar a URL removendo os filtros
    const urlFilters: Record<string, string> = {};
    
    // Copiar apenas filtros não vazios dos filtros iniciais
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value && value !== "" && key !== "tipo" && key !== "operacao" && key !== "bairro") {
        urlFilters[key] = value;
      }
    });
    
    const newUrl = buildListingsUrl(urlFilters);
    
    // Apenas navegar - o useEffect vai detectar a mudança na URL
    router.push(newUrl);
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
      <Header />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="hidden lg:block flex-shrink-0">
                <div className="w-64 h-96 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-4 sm:mb-6"></div>
                
                <ListingsSkeleton 
                  isCondominium={initialFilters.tipo === "Condomínio"} 
                  count={6} 
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="hidden lg:block flex-shrink-0">
                <ResultsFilters
                  filters={combinedFilters}
                  onFilterChange={(key: string, value: string | string[]) => {
                    // Determina se é um filtro de API ou cliente
                    if (key === "operacao" || key === "tipo") {
                      handleApiFilterChange(key, value as string);
                    } else {
                      handleClientFilterChange(key, value);
                    }
                  }}
                  onClearFilters={handleClearFilters}
                  onSearch={() => {}} // Não precisa mais do botão de busca
                />
              </div>
              
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <div className="text-sm text-gray-600">
                    {(initialFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length)} resultado{(initialFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length) !== 1 ? "s" : ""}
                  </div>
                  <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>Filtros</Button>
                </div>
                <LocationSearchField
                  currentLocation={currentLocation ? (initialFilters.bairro ? `${initialFilters.bairro}, ${currentLocation}` : currentLocation) : "Carregando..."}
                  currentFilters={{
                    operacao: initialFilters.operacao,
                    tipo: initialFilters.tipo,
                    bairro: initialFilters.bairro || "",
                  }}
                  className="mb-4 sm:mb-6"
                />
                
                {(initialFilters.tipo === "Condomínio" ? condoResults.length === 0 : results.length === 0) ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-gray-600 font-medium">
                    Nenhum imóvel encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 hidden lg:block">
                      <div className="text-sm text-gray-600">
                        {initialFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length} resultado{(initialFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length) !== 1 ? 's' : ''} encontrado{(initialFilters.tipo === "Condomínio" ? condoResults.length : filteredResults.length) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {initialFilters.tipo === "Condomínio"
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
      
      {isFiltersOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFiltersOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white p-4 overflow-y-auto shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900">Filtros</div>
              <Button variant="outline" onClick={() => setIsFiltersOpen(false)}>Fechar</Button>
            </div>
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
                setIsFiltersOpen(false);
              }}
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Listings() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="hidden lg:block flex-shrink-0">
                <div className="w-64 h-96 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-4 sm:mb-6"></div>
                
                <ListingsSkeleton count={6} />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
} 