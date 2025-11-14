"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import FeaturedCondominiumCard from "./FeaturedCondominiumCard";
import { CondominiumCard } from "../types/listings";
import { fetchFeaturedCondominiums } from "../lib/fetchFeaturedCondominiums";
import CondominiumCardSkeleton from "./CondominiumCardSkeleton";

interface FeaturedCondominiumsProps {
  cityId?: number;
  initialCondominiums?: CondominiumCard[];
  shouldRevalidate?: boolean;
  onDataLoaded?: (data: {
    condominiums: CondominiumCard[];
    cityId?: number;
    timestamp: number;
  }) => void;
}

export default function FeaturedCondominiums({
  cityId,
  initialCondominiums,
  shouldRevalidate,
  onDataLoaded,
}: FeaturedCondominiumsProps) {
  const [condominiums, setCondominiums] = useState<CondominiumCard[]>(initialCondominiums ?? []);
  const [loading, setLoading] = useState(!(initialCondominiums?.length));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCondominiums) {
      setCondominiums(initialCondominiums);
    }
  }, [initialCondominiums]);

  useEffect(() => {
    let isMounted = true;
    const hasInitialData = Boolean(initialCondominiums?.length);
    const needsFetch = shouldRevalidate || !hasInitialData;

    if (!needsFetch) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadFeaturedCondominiums = async () => {
      if (!hasInitialData) {
        setLoading(true);
      }

      try {
        setError(null);

        const featured = await fetchFeaturedCondominiums({
          cityId,
          limit: 6,
          offset: 0,
        });

        if (!isMounted) {
          return;
        }

        setCondominiums(featured);
        onDataLoaded?.({
          condominiums: featured,
          cityId,
          timestamp: Date.now(),
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error("Error loading featured condominiums:", err);
        setError("Erro ao carregar condomínios em destaque");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedCondominiums();

    return () => {
      isMounted = false;
    };
  }, [cityId, shouldRevalidate, initialCondominiums, onDataLoaded]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lançamentos em Destaque</h2>
            <p className="text-gray-600">Descubra os lançamentos mais exclusivos da região</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CondominiumCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || condominiums.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Lançamentos em Destaque - Venda</h2>
          <p className="text-gray-600 mb-8">Descubra os lançamentos mais exclusivos da região</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {condominiums.map((condominium) => (
            <FeaturedCondominiumCard
              key={condominium.id}
              {...condominium}
              className="h-full"
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/launches?localizacao=3205309&operacao=lancamento"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-secondary transition-colors"
          >
            Ver Todos os Lançamentos
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
