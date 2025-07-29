"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../../components/Header";
import LoadingModal from "../../components/LoadingModal";
import { fetchListings } from "../../lib/fetchListings";
import HorizontalPropertyCard from "../../components/HorizontalPropertyCard";
import ResultsFilters from "../../components/ResultsFilters";
import LocationSearchField from "../../components/LocationSearchField";
import { PropertyCard as PropertyCardType } from "../../types/listings";
import { parseFiltersFromSearchParams, validateFilters, getTransactionType } from "../../lib/filters";

function translatePropertyType(propertyType: string): string {
  const translations: { [key: string]: string } = {
    "apartment": "Apartamento",
    "house": "Casa",
    "studio": "Kitnet",
    "loft": "Loft",
    "penthouse": "Cobertura",
    "townhouse": "Casa Geminada",
    "land": "Terreno",
    "commercial": "Comercial",
    "office": "Escritório",
    "store": "Loja",
    "warehouse": "Galpão",
  };
  
  return translations[propertyType.toLowerCase()] || propertyType;
}

function ResultadosContent() {
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PropertyCardType[]>([]);
  const [filters, setFilters] = useState({
    tipo: initialFilters.tipo,
    operacao: initialFilters.operacao,
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

  const fetchResults = async (currentFilters = filters) => {
    setLoading(true);
    const validation = validateFilters(initialFilters);
    if (!validation.isValid) {
      setResults([]);
      setLoading(false);
      return;
    }

    const transactionType = getTransactionType(currentFilters.operacao || initialFilters.operacao);
    
    const listings = await fetchListings({
      cityId: validation.cityId!,
      transactionType,
      tipo: currentFilters.tipo ? (currentFilters.tipo as "Casa" | "Apartamento") : undefined,
      bairro: initialFilters.bairro,
      limit: 100,
      offset: 0,
    });
    
    setResults(listings);
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: "",
      operacao: "",
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
  };

  const handleSearch = () => {
    fetchResults(filters);
  };

  const filteredResults = results.filter(property => {
    // Se não há filtros aplicados, mostrar todos os resultados
    const hasActiveFilters = filters.tipo || filters.operacao || filters.quartos || filters.banheiros || 
                           filters.vagas || filters.precoMin || filters.precoMax || filters.areaMin || 
                           filters.areaMax || filters.anoMin || filters.anoMax || filters.caracteristicas.length > 0;
    
    if (!hasActiveFilters) {
      return true;
    }
    
    if (filters.tipo && filters.tipo !== "") {
      const translatedType = translatePropertyType(property.property_type);
      if (translatedType !== filters.tipo) return false;
    }
    
    if (filters.operacao && filters.operacao !== "") {
      const isForRent = property.forRent;
      if (filters.operacao === "comprar" && isForRent) return false;
      if (filters.operacao === "alugar" && !isForRent) return false;
    }
    
    if (filters.quartos && filters.quartos !== "") {
      const quartos = parseInt(filters.quartos);
      if (filters.quartos === "5+" && (property.bedroom_count || 0) < 5) return false;
      if (filters.quartos !== "5+" && property.bedroom_count !== quartos) return false;
    }
    
    if (filters.banheiros && filters.banheiros !== "") {
      const banheiros = parseInt(filters.banheiros);
      if (filters.banheiros === "5+" && (property.bathroom_count || 0) < 5) return false;
      if (filters.banheiros !== "5+" && property.bathroom_count !== banheiros) return false;
    }
    
    if (filters.vagas && filters.vagas !== "") {
      const vagas = parseInt(filters.vagas);
      if (filters.vagas === "5+" && (property.garage_count || 0) < 5) return false;
      if (filters.vagas !== "5+" && property.garage_count !== vagas) return false;
    }
    
    if (filters.precoMin && filters.precoMin !== "") {
      const precoMin = parseFloat(filters.precoMin);
      const propertyPrice = property.forRent 
        ? property.rental_price_amount 
        : property.list_price_amount;
      if (!propertyPrice || propertyPrice < precoMin) return false;
    }
    
    if (filters.precoMax && filters.precoMax !== "") {
      const precoMax = parseFloat(filters.precoMax);
      const propertyPrice = property.forRent 
        ? property.rental_price_amount 
        : property.list_price_amount;
      if (!propertyPrice || propertyPrice > precoMax) return false;
    }
    
    if (filters.areaMin && filters.areaMin !== "") {
      const areaMin = parseFloat(filters.areaMin);
      if (!property.area || property.area < areaMin) return false;
    }
    
    if (filters.areaMax && filters.areaMax !== "") {
      const areaMax = parseFloat(filters.areaMax);
      if (!property.area || property.area > areaMax) return false;
    }
    
    if (filters.anoMin && filters.anoMin !== "") {
      const anoMin = parseInt(filters.anoMin);
      if (!property.year_built || property.year_built < anoMin) return false;
    }
    
    if (filters.anoMax && filters.anoMax !== "") {
      const anoMax = parseInt(filters.anoMax);
      if (!property.year_built || property.year_built > anoMax) return false;
    }
    
    if (filters.caracteristicas.length > 0) {
      const hasAllFeatures = filters.caracteristicas.every(feature => {
        const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
        return property[featureKey as keyof typeof property] === true;
      });
      if (!hasAllFeatures) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading && <LoadingModal />}
          
          {!loading && (
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <ResultsFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  onSearch={handleSearch}
                />
              </div>
              
              <div className="flex-1">
                <LocationSearchField
                  currentLocation={initialFilters.bairro || "Vitória - ES"}
                  currentFilters={{
                    operacao: initialFilters.operacao,
                    tipo: initialFilters.tipo,
                    bairro: initialFilters.bairro || "",
                  }}
                />
                
                {results.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-gray-600 font-medium">
                    Nenhum imóvel encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="text-sm text-gray-600">
                        {filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {filteredResults.map((property, idx) => (
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
    <Suspense fallback={<LoadingModal />}>
      <ResultadosContent />
    </Suspense>
  );
} 