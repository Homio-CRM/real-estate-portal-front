"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import LoadingModal from "../../../components/LoadingModal";
import { CondominiumCard, PropertyCard } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import { MapPin, Camera, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

type CondominiumDetail = CondominiumCard & {
  apartments?: PropertyCard[];
};

export default function CondominiumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [condo, setCondo] = useState<CondominiumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    async function fetchCondo() {
      if (params.id) {
        const res = await fetch(`/api/condominium/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCondo(data);
        }
        setLoading(false);
      }
    }
    fetchCondo();
  }, [params.id]);

  if (loading) {
    return <LoadingModal />;
  }

  if (!condo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Condomínio não encontrado</h1>
              <button onClick={() => router.back()} className="text-primary hover:underline">Voltar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const media = condo.media || [];
  const displayedImage = media[currentMediaIndex]?.url || condo.image || "/placeholder-property.jpg";

  const formatAreaRange = () => {
    if (condo.min_area && condo.max_area) {
      if (condo.min_area === condo.max_area) return `${condo.min_area} m²`;
      return `${condo.min_area} - ${condo.max_area} m²`;
    }
    if (condo.min_area) return `A partir de ${condo.min_area} m²`;
    return "Área sob consulta";
  };

  const formatPriceRange = () => {
    if (condo.min_price && condo.max_price) {
      if (condo.min_price === condo.max_price) return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(condo.min_price);
      return `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(condo.min_price)} - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(condo.max_price)}`;
    }
    if (condo.min_price) return `A partir de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(condo.min_price)}`;
    return "Preço sob consulta";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {media.length > 0 ? (
              <div className="relative h-96 bg-white flex items-center justify-center">
                <img src={displayedImage} alt={condo.name} className="w-full h-full object-contain bg-white" />
                {media.length > 1 && (
                  <>
                    <button aria-label="Imagem anterior" className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70" onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? (media.length || 1) - 1 : prev - 1))}>
                      <ChevronLeft size={20} />
                    </button>
                    <button aria-label="Próxima imagem" className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70" onClick={() => setCurrentMediaIndex((prev) => (prev === (media.length || 1) - 1 ? 0 : prev + 1))}>
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentMediaIndex + 1} / {media.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sem fotos disponíveis</p>
                  <p className="text-gray-500 text-sm">Imagem do condomínio não encontrada</p>
                </div>
              </div>
            )}

            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{condo.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-4">
                <div className="text-2xl font-bold text-green-600">{formatPriceRange()}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{condo.neighborhood}, {condo.display_address}</span>
                </div>
                <div className="text-gray-600">{formatAreaRange()}</div>
              </div>

              {condo.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <p className="text-gray-700">{condo.description}</p>
                </div>
              )}

              {Array.isArray(condo.apartments) && condo.apartments.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Apartamentos neste Condomínio</h2>
                  <div className="space-y-4">
                    {condo.apartments.map((p) => (
                      <HorizontalPropertyCard key={p.listing_id} {...p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



