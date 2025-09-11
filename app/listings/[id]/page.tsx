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
import { fetchListingById, fetchListings } from "../../../lib/fetchListings";
import { PropertyCard as PropertyCardType } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import Footer from "../../../components/Footer";
import { translatePropertyType } from "../../../lib/propertyTypes";
import { ImageGallery } from "../../../components/ImageGallery";
import Image from "next/image";

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

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyCardType | null>(null);
  const [similarProperties, setSimilarProperties] = useState<PropertyCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [condominiumInfo, setCondominiumInfo] = useState<{ id: string; name?: string; min_price?: number; max_price?: number; min_area?: number; max_area?: number } | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [agencyPhone, setAgencyPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;
      
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
      
      const data = await fetchListingById(params.id as string);
      setProperty(data);
      setLoading(false);

      if (!data) return;

      const txType = data.transaction_type === "rental" ? "rent" : "sale";

      if (data.property_type === "apartment" && data.condominium_id) {
        try {
          const res = await fetch(`/api/condominium/${data.condominium_id}`);
          if (res.ok) {
            const condo = await res.json();
            setCondominiumInfo({ id: condo.id || data.condominium_id, name: condo.name, min_price: condo.min_price, max_price: condo.max_price, min_area: condo.min_area, max_area: condo.max_area });
            const inSameCondo: PropertyCardType[] = (Array.isArray(condo.apartments) ? condo.apartments : [])
              .filter((p: PropertyCardType) => p.listing_id !== data.listing_id)
              .slice(0, 3);
            if (inSameCondo.length > 0) {
              setSimilarProperties(inSameCondo);
              return;
            }
          }
        } catch {}
      }

      if (data.neighborhood) {
        try {
          const byNeighborhood = await fetchListings({
            cityId: data.city_id,
            transactionType: txType,
            tipo: data.property_type === "apartment" ? "Apartamento" : "Casa",
            bairro: data.neighborhood,
            limit: 6,
            offset: 0,
          });
          const filtered = byNeighborhood.filter((p: PropertyCardType) => p.listing_id !== data.listing_id).slice(0, 3);
          if (filtered.length > 0) {
            setSimilarProperties(filtered);
            return;
          }
        } catch {}
      }

      try {
        const byCity = await fetchListings({
          cityId: data.city_id,
          transactionType: txType,
          tipo: data.property_type === "apartment" ? "Apartamento" : "Casa",
          limit: 6,
          offset: 0,
        });
        const filtered = byCity.filter((p: PropertyCardType) => p.listing_id !== data.listing_id).slice(0, 3);
        setSimilarProperties(filtered);
      } catch {
        setSimilarProperties([]);
      }
    }
    fetchProperty();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ListingDetailSkeleton />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Imóvel não encontrado
              </h1>
              <button
                onClick={() => router.back()}
                className="text-primary hover:underline"
              >
                Voltar aos listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  ].filter(amenity => property[amenity.key as keyof typeof property]);

  const breadcrumbs = [
    property.forRent ? "Aluguel" : "Venda",
    "ES",
    `${translatePropertyType(property.property_type || "")} ${property.forRent ? "à aluguel" : "à venda"}`,
    property.neighborhood || "Vitória",
    property.address || "Endereço não informado"
  ];

  const generateWhatsAppLink = () => {
    if (!agencyPhone) return '#';
    const message = `Olá! Tenho interesse no imóvel: ${property.title}. Poderia me passar mais informações?`;
    const cleanPhone = agencyPhone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Voltar a busca
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {property.media && property.media.length > 0 ? (
              <div>
                <div className="relative h-64 sm:h-80 md:h-96 bg-white flex items-center justify-center">
                  <Image
                    src={property.media[currentMediaIndex]?.url || property.image || "/placeholder-property.jpg"}
                    alt={property.title}
                    fill
                    className="object-cover bg-white cursor-pointer"
                    onClick={() => setShowGallery(true)}
                  />
                  {property.media.length > 1 && (
                    <>
                      <button
                        aria-label="Imagem anterior"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? (property.media?.length || 1) - 1 : prev - 1))}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        aria-label="Próxima imagem"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === (property.media?.length || 1) - 1 ? 0 : prev + 1))}
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentMediaIndex + 1} / {property.media.length}
                      </div>
                    </>
                  )}
                </div>
                {property.media.length > 1 && (
                  <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-white border-t border-gray-200">
                    {property.media.map((m, idx) => (
                      <button
                        key={m.id || m.url + idx}
                        className={`relative w-24 h-16 rounded overflow-hidden border ${idx === currentMediaIndex ? "border-secondary" : "border-gray-200"}`}
                        onClick={() => setCurrentMediaIndex(idx)}
                        aria-label={`Ver imagem ${idx + 1}`}
                      >
                        <Image src={m.url} alt={property.title} width={96} height={64} className="w-full h-full object-contain bg-white" />
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
                  <p className="text-gray-500 text-sm">Imagem do imóvel não encontrada</p>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex gap-3 mb-4 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto justify-center" onClick={() => setShowGallery(true)}>
                  <Camera size={16} />
                  {property.media?.length || 0} fotos
                </button>
                {property.latitude && property.longitude && (
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto justify-center"
                    onClick={() => window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, '_blank')}
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
                  {property.forRent ? "Aluguel" : "Venda"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              </div>

              {property.property_type === "apartment" && property.condominium_id && (
                <div className="flex items-center gap-2 mb-6 text-gray-700">
                  <Building size={18} className="text-secondary" />
                  <span>Condomínio: </span>
                  <a href={`/condominiums/${property.condominium_id}`} className="text-primary hover:underline">
                    {condominiumInfo?.name || "Ver condomínio"}
                  </a>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {property.price}
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
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Ruler size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.area || 0} m²</div>
                           <div className="text-xs md:text-sm text-gray-500">Área</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Bed size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.bedroom_count || 0} quartos</div>
                           <div className="text-xs md:text-sm text-gray-500">Dormitórios</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Bath size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.bathroom_count || 0} banheiros</div>
                           <div className="text-xs md:text-sm text-gray-500">Banheiros</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Car size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.garage_count || 0} vagas</div>
                           <div className="text-xs md:text-sm text-gray-500">Garagem</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Home size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.suite_count || 0} suítes</div>
                           <div className="text-xs md:text-sm text-gray-500">Suítes</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <span className="inline-flex w-7 h-7 items-center justify-center text-secondary shrink-0">
                           <Calendar size={22} />
                         </span>
                         <div>
                           <div className="font-bold text-base md:text-lg">{property.year_built || "N/A"}</div>
                           <div className="text-xs md:text-sm text-gray-500">Ano</div>
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
                               <IconComponent size={20} className="text-secondary" />
                               <span>{amenity.label}</span>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   )}

                                     {property.description && (
                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                       <p className="text-gray-700">{property.description}</p>
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
                       <p>{property.neighborhood}, {property.display_address}</p>
                       {property.postal_code && <p>CEP: {property.postal_code}</p>}
                     </div>
                   </div>

                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                     <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                       <span className="text-green-600">$</span>
                       Resumo Financeiro
                     </h3>
                     <div className="space-y-2 text-gray-700">
                       <div>
                         <span className="font-medium">
                           {property.forRent ? "Aluguel mensal:" : "Valor do imóvel:"}
                         </span> {property.price}
                       </div>
                       {property.property_administration_fee_amount && (
                         <div>
                           <span className="font-medium">Condomínio:</span> R$ {property.property_administration_fee_amount.toLocaleString("pt-BR")}
                         </div>
                       )}
                       {property.iptu_amount && (
                         <div>
                           <span className="font-medium">IPTU:</span> R$ {property.iptu_amount.toLocaleString("pt-BR")}
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
                           Entre em contato via WhatsApp para mais informações sobre este imóvel.
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
           
           {similarProperties.length > 0 && (
             <div className="mt-12">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">
                 Imóveis Similares
               </h2>
               <div className="space-y-4">
                 {similarProperties.map((similarProperty) => (
                   <HorizontalPropertyCard 
                     key={similarProperty.listing_id} 
                     {...similarProperty} 
                   />
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
       
             <Footer />
      
      {showGallery && property?.media && (
        <ImageGallery
          mediaItems={property.media.map(item => ({
            id: item.id || '',
            url: item.url,
            caption: item.caption,
            is_primary: item.is_primary
          }))}
          onClose={() => setShowGallery(false)}
        />
      )}

      {property && agencyPhone && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-gray-900">{property.price}</div>
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