"use client";

import { useState, useEffect } from "react";
import { fetchListings } from "../lib/fetchListings";
import { PropertyCard } from "../types/listings";
import { Building, Home, Ruler, Bed, Bath, Car } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

interface FeaturedPropertiesProps {
  cityId?: number;
}

export default function FeaturedProperties({ cityId }: FeaturedPropertiesProps) {
  const [activeTab, setActiveTab] = useState<"comprar" | "alugar">("comprar");
  const [saleProperties, setSaleProperties] = useState<PropertyCard[]>([]);
  const [rentProperties, setRentProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      setError(null);

      try {
        const saleResults = await fetchListings({
          cityId: cityId || 3205309,
          transactionType: "sale",
          limit: 6,
          offset: 0,
        });

        const rentResults = await fetchListings({
          cityId: cityId || 3205309,
          transactionType: "rent",
          limit: 6,
          offset: 0,
        });

        const sortedSaleResults = saleResults.sort((a, b) => {
          const priceA = a.list_price_amount || 0;
          const priceB = b.list_price_amount || 0;
          return priceB - priceA;
        });

        setSaleProperties(sortedSaleResults.slice(0, 6));
        setRentProperties(rentResults.slice(0, 6));
      } catch (err) {
        setError("Erro ao carregar imóveis em destaque");
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, [cityId]);

  const currentProperties = activeTab === "comprar" ? saleProperties : rentProperties;

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Apartamentos em Destaque</h2>
            <p className="text-gray-600">Descubra os melhores apartamentos da região</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Building size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Erro ao carregar imóveis</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-gray-600 text-lg">
            {activeTab === "comprar"
              ? "Os imóveis mais exclusivos para compra"
              : "Os melhores imóveis para aluguel"
            }
          </p>
        </div>

        {/* Abas */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab("comprar")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === "comprar"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Comprar
            </button>
            <button
              onClick={() => setActiveTab("alugar")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === "alugar"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              Alugar
            </button>
          </div>
        </div>

        {currentProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProperties.map((property) => (
              <div
                key={property.listing_id}
                className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={property.image || "/placeholder-property.jpg"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3">
                    {property.display_address}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {property.area && property.area > 0 && (
                      <div className="flex items-center gap-1">
                        <Ruler size={14} />
                        <span>{property.area}m²</span>
                      </div>
                    )}
                    {property.bedroom_count && property.bedroom_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed size={14} />
                        <span>{property.bedroom_count}</span>
                      </div>
                    )}
                    {property.bathroom_count && property.bathroom_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath size={14} />
                        <span>{property.bathroom_count}</span>
                      </div>
                    )}
                    {property.garage_count && property.garage_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Car size={14} />
                        <span>{property.garage_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(property.list_price_amount || property.price)}
                      </p>
                      {property.iptu && (
                        <p className="text-sm text-gray-500">
                          +{formatCurrency(property.iptu_amount || property.iptu)} - IPTU
                        </p>
                      )}
                    </div>

                    <button className="text-primary hover:text-primary/80 font-medium text-sm">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Nenhum imóvel disponível para {activeTab === "comprar" ? "compra" : "aluguel"}
            </p>
            <p className="text-gray-500 text-sm">
              Tente ajustar os filtros ou volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
