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
  });

  useEffect(() => {
    setLoading(true);
    async function fetchResults() {
      const validation = validateFilters(initialFilters);
      if (!validation.isValid) {
        setResults([]);
        setLoading(false);
        return;
      }

      const transactionType = getTransactionType(initialFilters.operacao);
      const listings = await fetchListings({
        cityId: validation.cityId!,
        transactionType,
        tipo: initialFilters.tipo as "Casa" | "Apartamento",
        bairro: initialFilters.bairro,
        limit: 30,
        offset: 0,
      });
      setResults(listings);
      setLoading(false);
    }
    fetchResults();
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: "",
      operacao: "",
      quartos: "",
      banheiros: "",
      vagas: "",
    });
  };

  const handleSearch = () => {
    // Implementar busca com novos filtros
    console.log("Buscar com filtros:", filters);
  };

  const filteredResults = results.filter(property => {
    if (filters.tipo) {
      const translatedType = translatePropertyType(property.property_type);
      if (translatedType !== filters.tipo) return false;
    }
    if (filters.quartos && property.bedroom_count !== parseInt(filters.quartos)) return false;
    if (filters.banheiros && property.bathroom_count !== parseInt(filters.banheiros)) return false;
    if (filters.vagas && property.garage_count !== parseInt(filters.vagas)) return false;
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