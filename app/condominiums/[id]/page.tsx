"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Bed, 
  Bath, 
  Car, 
  Ruler, 
  Calendar, 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Building,
  Dumbbell,
  Waves,
  Sparkles,
  PartyPopper,
  Baby,
  ChefHat,
  Flame,
  Trophy,
  Camera,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Header from "../../../components/Header";
import CondominiumDetailSkeleton from "../../../components/CondominiumDetailSkeleton";
import { CondominiumCard, PropertyCard } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import Footer from "../../../components/Footer";
import { ImageGallery } from "../../../components/ImageGallery";

type CondominiumDetail = CondominiumCard & {
  apartments?: PropertyCard[];
};

type CondominiumStats = {
  min_bedrooms: number;
  max_bedrooms: number;
  min_suites: number;
  max_suites: number;
  avg_condo_fee: number;
  avg_iptu: number;
  total_apartments: number;
};

function getAmenityIcon(amenity: string) {
  const icons: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
    gym: Dumbbell,
    pool: Waves,
    sauna: Sparkles,
    party_room: PartyPopper,
    playground: Baby,
    gourmet_area: ChefHat,
    tennis_court: Trophy,
    barbecue_area: Flame,
    multipurpose_court: Trophy,
  };
  return icons[amenity] || Building;
}

export default function CondominiumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [condo, setCondo] = useState<CondominiumDetail | null>(null);
  const [stats, setStats] = useState<CondominiumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [agencyPhone, setAgencyPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCondo() {
      if (params.id) {
        // Buscar telefone da agência
        try {
          const phoneResponse = await fetch('/api/agency/phone');
          if (phoneResponse.ok) {
            const phoneData = await phoneResponse.json();
            setAgencyPhone(phoneData.phone);
          }
        } catch (error) {
          console.error('Error fetching agency phone:', error);
        }
        
        try {
          const [condoRes, statsRes] = await Promise.all([
            fetch(`/api/condominium/${params.id}`),
            fetch(`/api/condominium/${params.id}/stats`)
          ]);

                     if (condoRes.ok) {
             const condoData = await condoRes.json();
             console.log("Condominium data:", condoData);
             console.log("Apartments count:", condoData.apartments?.length || 0);
             setCondo(condoData);
           }

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } catch (error) {
          console.error("Error fetching condominium data:", error);
        }
        setLoading(false);
      }
    }
    fetchCondo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CondominiumDetailSkeleton />
      </div>
    );
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

  const generateWhatsAppLink = () => {
    if (!agencyPhone) return '#';
    const message = `Olá! Tenho interesse no condomínio: ${condo.name}. Poderia me passar mais informações?`;
    const cleanPhone = agencyPhone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const amenities = [
    { key: "gym", label: "Academia" },
    { key: "pool", label: "Piscina" },
    { key: "sauna", label: "Sauna" },
    { key: "party_room", label: "Salão de Festas" },
    { key: "playground", label: "Playground" },
    { key: "gourmet_area", label: "Espaço Gourmet" },
    { key: "tennis_court", label: "Quadra de Tênis" },
    { key: "barbecue_area", label: "Churrasqueira" },
    { key: "multipurpose_court", label: "Quadra Poliesportiva" },
  ].filter(amenity => condo[amenity.key as keyof typeof condo]);

  const breadcrumbs = [
    "Venda",
    "ES",
    "Condomínio à venda",
    condo.neighborhood || "Vitória",
    condo.address || "Endereço não informado"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {media.length > 0 ? (
              <div>
                <div className="relative h-64 sm:h-80 md:h-96 bg-white flex items-center justify-center">
                  <img src={displayedImage} alt={condo.name} className="w-full h-full object-cover bg-white cursor-pointer" onClick={() => setShowGallery(true)} />
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
                {media.length > 1 && (
                  <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-white border-t border-gray-200">
                    {media.map((m, idx) => (
                      <button
                        key={m.id || m.url + idx}
                        className={`relative w-24 h-16 rounded overflow-hidden border ${idx === currentMediaIndex ? "border-secondary" : "border-gray-200"}`}
                        onClick={() => setCurrentMediaIndex(idx)}
                        aria-label={`Ver imagem ${idx + 1}`}
                      >
                        <img src={m.url} alt={condo.name} className="w-full h-full object-contain bg-white" />
                      </button>
                    ))}
                  </div>
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
              <div className="flex gap-3 mb-4 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto justify-center" onClick={() => setShowGallery(true)}>
                  <Camera size={16} />
                  {media.length} fotos
                </button>
                {condo.latitude && condo.longitude && (
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto justify-center"
                    onClick={() => window.open(`https://www.google.com/maps?q=${condo.latitude},${condo.longitude}`, '_blank')}
                  >
                    <MapPin size={16} />
                    Ver no mapa
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {breadcrumbs.join(" / ")}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 mb-6">
                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Venda
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{condo.name}</h1>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatPriceRange()}
                </div>
                {agencyPhone && (
                  <a 
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Phone size={20} />
                    WhatsApp
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Ruler size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">{formatAreaRange()}</div>
                          <div className="text-sm text-gray-500">Área</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Bed size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">
                            {stats ? `${stats.min_bedrooms} - ${stats.max_bedrooms} quartos` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Dormitórios</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Bath size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">N/A</div>
                          <div className="text-sm text-gray-500">Banheiros</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Car size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">N/A</div>
                          <div className="text-sm text-gray-500">Garagem</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Home size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">
                            {stats ? `${stats.min_suites} - ${stats.max_suites} suítes` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Suítes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar size={24} className="text-secondary" />
                        <div>
                          <div className="font-bold text-lg">{condo.year_built || "N/A"}</div>
                          <div className="text-sm text-gray-500">Ano</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {amenities.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <Building size={20} className="text-secondary" />
                        Características
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {amenities.map((amenity) => {
                          const IconComponent = getAmenityIcon(amenity.key);
                          return (
                            <div key={amenity.key} className="flex items-center gap-2 text-gray-700">
                              <IconComponent size={16} className="text-secondary" />
                              <span>{amenity.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                                                                           {condo.description && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                        <p className="text-gray-700">{condo.description}</p>
                      </div>
                    )}

                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <MapPin size={20} className="text-secondary" />
                      Localização
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p>{condo.neighborhood}, {condo.display_address}</p>
                      {condo.postal_code && <p>CEP: {condo.postal_code}</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <span className="text-green-600">$</span>
                      Resumo Financeiro
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div>
                        <span className="font-medium">Valor do imóvel:</span> {formatPriceRange()}
                      </div>
                      {stats && stats.avg_condo_fee > 0 && (
                        <div>
                          <span className="font-medium">Condomínio:</span> R$ {stats.avg_condo_fee.toLocaleString("pt-BR")}
                        </div>
                      )}
                      {stats && stats.avg_iptu > 0 && (
                        <div>
                          <span className="font-medium">IPTU:</span> R$ {stats.avg_iptu.toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </div>

                  {agencyPhone && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <Phone size={20} className="text-secondary" />
                        Contato
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Entre em contato via WhatsApp para mais informações sobre este condomínio.
                        </p>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={16} />
                          <span>{agencyPhone}</span>
                        </div>
                        <a 
                          href={generateWhatsAppLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          <Phone size={16} />
                          Falar no WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
                     </div>
           
           <div className="mt-8">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
               <h3 className="text-xl font-semibold text-gray-900 mb-6">
                 Apartamentos Disponíveis neste Condomínio
               </h3>
               {Array.isArray(condo.apartments) && condo.apartments.length > 0 ? (
                 <div className="space-y-4">
                   {condo.apartments.map((apartment) => (
                     <HorizontalPropertyCard key={apartment.listing_id} {...apartment} />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <Building size={48} className="text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-600 mb-2">Nenhum apartamento disponível</p>
                   <p className="text-gray-500 text-sm">
                     Este condomínio ainda não possui apartamentos cadastrados para venda ou aluguel.
                   </p>
                 </div>
               )}
             </div>
           </div>

         </div>
       </div>
       
       <Footer />

      {showGallery && media.length > 0 && (
        <ImageGallery
          mediaItems={media.map((item) => ({ id: item.id || '', url: item.url, caption: item.caption, is_primary: item.is_primary }))}
          onClose={() => setShowGallery(false)}
        />
      )}

      {condo && agencyPhone && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-gray-900">{formatPriceRange()}</div>
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
          >
            WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}



