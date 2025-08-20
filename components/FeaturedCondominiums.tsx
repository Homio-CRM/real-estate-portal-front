"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import FeaturedCondominiumCard from "./FeaturedCondominiumCard";
import { CondominiumCard } from "../types/listings";
import { fetchFeaturedCondominiums } from "../lib/fetchFeaturedCondominiums";

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
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Condomínios em Destaque - Venda</h2>
            <p className="text-gray-600 mb-12">Descubra os lançamentos mais exclusivos da região</p>
          </div>
          
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Condomínios em Destaque - Venda</h2>
            <p className="text-gray-600 mb-12">Descubra os lançamentos mais exclusivos da região</p>
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Condomínios em Destaque - Venda</h2>
            <p className="text-gray-600 mb-12">Descubra os lançamentos mais exclusivos da região</p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum lançamento disponível no momento</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Condomínios em Destaque - Venda</h2>
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
            href="/resultados?tipo=Condomínio&operacao=venda"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Todos os Condomínios
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
