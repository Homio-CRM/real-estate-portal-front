"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchListings } from "../lib/fetchListings";
import { PropertyCard } from "../types/listings";
import { Building, Home, ChevronLeft, ChevronRight, Camera, Ruler, Bed, Bath, Car } from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";
import PropertyCardSkeleton from "./PropertyCardSkeleton";

interface FeaturedPropertiesProps {
  cityId?: number;
}

type Slide = { url: string; isMore?: boolean; moreCount?: number };

export default function FeaturedProperties({ cityId }: FeaturedPropertiesProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"comprar" | "alugar">("comprar");
  const [saleProperties, setSaleProperties] = useState<PropertyCard[]>([]);
  const [rentProperties, setRentProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // índice do slide por card
  const [currentIdx, setCurrentIdx] = useState<Record<string, number>>({});

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
        console.error("Erro ao buscar imóveis em destaque:", err);
        setError("Erro ao carregar imóveis em destaque");
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, [cityId]);

  const currentProperties = activeTab === "comprar" ? saleProperties : rentProperties;

  const handlePropertyClick = (property: PropertyCard) => {
    if (property.listing_id) {
      router.push(`/listings/${property.listing_id}`);
    }
  };

  const getPropertyImages = (property: PropertyCard): string[] => {
    const fromMedia =
      property.media && property.media.length > 0
        ? property.media.map((m) => m.url).filter((u): u is string => !!u)
        : [];
    const fallback = property.image ? [property.image] : [];
    const imgs = fromMedia.length ? fromMedia : fallback;
    // remove duplicadas simples
    return Array.from(new Set(imgs));
  };

  const buildSlides = (property: PropertyCard): Slide[] => {
    const imgs = getPropertyImages(property);
    // Sempre retorna pelo menos 1 slide (placeholder se não houver imagens)
    if (imgs.length === 0) {
      return [{ url: "" }];
    }
    
    // Se tem 4 ou menos imagens, mostra todas
    if (imgs.length <= 4) {
      return imgs.map((url) => ({ url }));
    }
    
    // Se tem mais de 4, mostra as primeiras 4 + 1 com overlay "+N fotos"
    const first4 = imgs.slice(0, 4).map((url) => ({ url }));
    const more = imgs.length - 4;
    const bg = imgs[4] || imgs[0];
    return [...first4, { url: bg, isMore: true, moreCount: more }];
  };

  const prevSlide = (property: PropertyCard) => {
    const id = String(property.listing_id || property.title);
    const slides = buildSlides(property);
    setCurrentIdx((s) => {
      const curr = s[id] ?? 0;
      // Não volta para o final, para no início
      const next = curr === 0 ? 0 : curr - 1;
      return { ...s, [id]: next };
    });
  };

  const nextSlide = (property: PropertyCard) => {
    const id = String(property.listing_id || property.title);
    const slides = buildSlides(property);
    setCurrentIdx((s) => {
      const curr = s[id] ?? 0;
      // Não vai para o início, para no final
      const next = curr === slides.length - 1 ? slides.length - 1 : curr + 1;
      return { ...s, [id]: next };
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Imóveis em Destaque</h2>
            <p className="text-gray-600">Descubra os melhores imóveis da região</p>
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
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Imóveis em Destaque</h2>
          <p className="text-gray-600 text-lg">
            {activeTab === "comprar" ? "Os imóveis mais exclusivos para compra" : "Os melhores imóveis para aluguel"}
          </p>
        </div>

        {/* Abas */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab("comprar")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "comprar" ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Comprar
            </button>
            <button
              onClick={() => setActiveTab("alugar")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "alugar" ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Alugar
            </button>
          </div>
        </div>

        {/* Grid */}
        {currentProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProperties.map((property) => {
              const slides = buildSlides(property);
              const id = String(property.listing_id || property.title);
              const idx = currentIdx[id] ?? 0;
              const curr = slides[idx];


              return (
                <div
                  key={property.listing_id ?? property.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePropertyClick(property)}
                >
                                                         {/* Header / Slider */}
                    <div className="relative h-56 md:h-60 bg-gray-200 overflow-hidden">
                      {/* Track */}
                      <div
                        className="flex h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${idx * 100}%)` }}
                      >
                        {slides.map((slide, slideIdx) => (
                          <div
                            key={slideIdx}
                            className="relative flex-none min-w-full w-full h-full"
                          >
                            {/* Imagem/placeholder preenchendo todo o slide */}
                            {slide.url && slide.url.trim() !== "" ? (
                              <img
                                src={slide.url}
                                alt={`${property.title} - Imagem ${slideIdx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`${slide.url && slide.url.trim() !== "" ? 'hidden' : ''} absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400`}>
                              <Camera size={48} className="mb-2" />
                              <span className="text-sm">Sem imagem</span>
                            </div>

                            {/* Overlay +X fotos quando for o slide especial */}
                            {slide.isMore && (
                              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center">
                                <Camera size={28} className="text-white mb-2" />
                                <span className="text-white text-lg font-semibold">
                                  +{slide.moreCount} fotos
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Setas – NÃO navegar para a página */}
                      {slides.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevSlide(property);
                            }}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full shadow border border-gray-200 transition-all ${
                              idx === 0
                                ? "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                                : "bg-white/95 text-gray-700 hover:bg-white"
                            }`}
                            aria-label="Anterior"
                            disabled={idx === 0}
                          >
                            <ChevronLeft size={18} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextSlide(property);
                            }}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full shadow border border-gray-200 transition-all ${
                              idx === slides.length - 1
                                ? "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                                : "bg-white/95 text-gray-700 hover:bg-white"
                            }`}
                            aria-label="Próximo"
                            disabled={idx === slides.length - 1}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}

                                             {/* Indicador de fotos */}
                       {slides.length > 1 && (
                         <div className="absolute bottom-3 left-3">
                           <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                             {idx + 1}/{slides.length}
                           </div>
                         </div>
                       )}
                    </div>

                                     {/* Conteúdo */}
                   <div className="p-4 flex flex-col min-h-[200px]">
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                       <p className="text-gray-600 text-sm mb-3 line-clamp-1">{property.display_address}</p>

                       <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                         {property.area && (
                           <div className="flex items-center gap-1">
                             <Ruler size={14} />
                             <span>{property.area}m²</span>
                           </div>
                         )}
                         {property.bedroom_count != null && (
                           <div className="flex items-center gap-1">
                             <Bed size={14} />
                             <span>{property.bedroom_count} quartos</span>
                           </div>
                         )}
                         {property.bathroom_count != null && (
                           <div className="flex items-center gap-1">
                             <Bath size={14} />
                             <span>{property.bathroom_count} banheiros</span>
                           </div>
                         )}
                         {property.garage_count != null && (
                           <div className="flex items-center gap-1">
                             <Car size={14} />
                             <span>{property.garage_count} vagas</span>
                           </div>
                         )}
                       </div>
                     </div>

                     <div className="flex items-center justify-between mt-4">
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

                       <span className="text-primary hover:text-primary/80 font-medium text-sm">Ver detalhes</span>
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Nenhum imóvel disponível para {activeTab === "comprar" ? "compra" : "aluguel"}
            </p>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros ou volte mais tarde.</p>
          </div>
        )}
      </div>
    </section>
  );
}
