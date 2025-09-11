"use client";

import { useState, useEffect } from "react";
import FeaturedCondominiumCard from "./FeaturedCondominiumCard";
import { CondominiumCard } from "../types/listings";
import { fetchFeaturedCondominiums } from "../lib/fetchFeaturedCondominiums";
import FeaturedCondominiumsSkeleton from "./FeaturedCondominiumsSkeleton";

interface FeaturedCondominiumsProps {
  cityId?: number;
}

export default function FeaturedCondominiums({ cityId }: FeaturedCondominiumsProps) {
  const [condominiums, setCondominiums] = useState<CondominiumCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedCondominiums = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const featured = await fetchFeaturedCondominiums({
          cityId,
          limit: 6,
          offset: 0
        });
        
        setCondominiums(featured);
      } catch (err) {
        console.error("Error loading featured condominiums:", err);
        setError("Erro ao carregar condomínios em destaque");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCondominiums();
  }, [cityId]);

  if (loading) {
    return <FeaturedCondominiumsSkeleton />;
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Condomínios em Lançamento</h2>
            <p className="text-gray-600 text-lg">Descubra os lançamentos mais exclusivos da região</p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (condominiums.length === 0) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Condomínios em Lançamento</h2>
            <p className="text-gray-600 text-lg">Descubra os lançamentos mais exclusivos da região</p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum lançamento disponível no momento</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Condomínios em Lançamento</h2>
          <p className="text-gray-600 text-lg">Descubra os lançamentos mais exclusivos da região</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {condominiums.map((condominium) => (
            <FeaturedCondominiumCard
              key={condominium.id}
              {...condominium}
              className="h-full"
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
