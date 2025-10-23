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
import ListingDetailSkeleton from "../../../components/ListingDetailSkeleton";
import { CondominiumCard, PropertyCard } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import Footer from "../../../components/Footer";
import ContactForm from "../../../components/ContactForm";

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

  useEffect(() => {
    async function fetchCondo() {
      if (params.id) {
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
    return <ListingDetailSkeleton />;
  }

  if (!condo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showLogo={false} />
        <div className="pt-4">
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
      <Header showLogo={false} />
      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {media.length > 0 ? (
              <div>
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
                {media.length > 1 && (
                  <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-white border-t border-gray-200">
                    {media.map((m, idx) => (
                      <button
                        key={m.id || m.url + idx}
                        className={`relative w-24 h-16 rounded overflow-hidden border ${idx === currentMediaIndex ? "border-purple-600" : "border-gray-200"}`}
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
              <div className="flex gap-3 mb-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Camera size={16} />
                  {media.length} fotos
                </button>
                {condo.latitude && condo.longitude && (
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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

              <div className="flex items-start gap-4 mb-6">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Venda
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{condo.name}</h1>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold text-green-600">
                  {formatPriceRange()}
                </div>
                <button 
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const phone = condo.owner_phone || condo.agent_phone;
                    if (phone) {
                      window.open(`tel:${phone}`, '_self');
                    }
                  }}
                >
                  <Phone size={20} />
                  Contatar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Ruler size={24} className="text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">{formatAreaRange()}</div>
                          <div className="text-sm text-gray-500">Área</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Bed size={24} className="text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">
                            {stats ? `${stats.min_bedrooms} - ${stats.max_bedrooms} quartos` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Dormitórios</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Bath size={24} className="text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">N/A</div>
                          <div className="text-sm text-gray-500">Banheiros</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Car size={24} className="text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">N/A</div>
                          <div className="text-sm text-gray-500">Garagem</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Home size={24} className="text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">
                            {stats ? `${stats.min_suites} - ${stats.max_suites} suítes` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Suítes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar size={24} className="text-purple-600" />
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
                        <Building size={20} className="text-purple-600" />
                        Características
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {amenities.map((amenity) => {
                          const IconComponent = getAmenityIcon(amenity.key);
                          return (
                            <div key={amenity.key} className="flex items-center gap-2 text-gray-700">
                              <IconComponent size={16} className="text-purple-600" />
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

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <ContactForm
                        propertyId={condo.id || ""}
                        propertyTitle={condo.name}
                      />
                      <p className="text-center text-sm text-gray-600 mt-2">
                        Entre em contato para mais informações
                      </p>
                    </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <MapPin size={20} className="text-purple-600" />
                      Localização
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p>{condo.neighborhood}, {condo.display_address}</p>
                      {condo.postal_code && <p>CEP: {condo.postal_code}</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Phone size={20} className="text-purple-600" />
                      Contatos
                    </h3>
                    <div className="space-y-4">
                      {condo.owner_name && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Proprietário</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>{condo.owner_name}</span>
                            </div>
                            {condo.owner_phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>{condo.owner_phone}</span>
                              </div>
                            )}
                            {condo.owner_email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span>{condo.owner_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {condo.agent_name && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Corretor</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>{condo.agent_name}</span>
                            </div>
                            {condo.agent_phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>{condo.agent_phone}</span>
                              </div>
                            )}
                            {condo.agent_email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span>{condo.agent_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
     </div>
   );
 }



