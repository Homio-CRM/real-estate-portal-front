"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../../components/Header";
import LoadingModal from "../../components/LoadingModal";
import { fetchListings } from "../../lib/fetchListings";
import PropertyCard from "../../components/PropertyCard";
import { PropertyCard as PropertyCardType } from "../../types/listings";
import { parseFiltersFromSearchParams, validateFilters, getTransactionType } from "../../lib/filters";

function ResultadosContent() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<PropertyCardType[]>([]);

  useEffect(() => {
    setLoading(true);
    async function fetchResults() {
      const validation = validateFilters(filters);
      if (!validation.isValid) {
        setResults([]);
        setLoading(false);
        return;
      }

      const transactionType = getTransactionType(filters.operacao);
      const listings = await fetchListings({
        cityId: validation.cityId!,
        transactionType,
        tipo: filters.tipo as "Casa" | "Apartamento",
        limit: 30,
        offset: 0,
      });
      setResults(listings);
      setLoading(false);
    }
    fetchResults();
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto py-8">
        {loading && <LoadingModal />}
        {!loading && results.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-muted-foreground font-medium">
            Nenhum imóvel encontrado para os filtros selecionados.
          </div>
        )}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((property, idx) => (
              <PropertyCard key={property.listing_id || idx} {...property} />
            ))}
          </div>
        )}
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