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
import LoadingModal from "../../../components/LoadingModal";
import { fetchListingById, fetchListings } from "../../../lib/fetchListings";
import { PropertyCard as PropertyCardType } from "../../../types/listings";
import HorizontalPropertyCard from "../../../components/HorizontalPropertyCard";
import ContactForm from "../../../components/ContactForm";
import Footer from "../../../components/Footer";
import { translatePropertyType } from "../../../lib/propertyTypes";

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

  useEffect(() => {
    async function fetchProperty() {
      if (!params.id) return;
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
    return <LoadingModal />;
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
    `${translatePropertyType(property.property_type)} ${property.forRent ? "à aluguel" : "à venda"}`,
    property.neighborhood || "Vitória",
    property.address || "Endereço não informado"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24">
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
                <div className="relative h-96 bg-white flex items-center justify-center">
                  <img
                    src={property.media[currentMediaIndex]?.url || property.image}
                    alt={property.title}
                    className="w-full h-full object-contain bg-white"
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
                        className={`relative w-24 h-16 rounded overflow-hidden border ${idx === currentMediaIndex ? "border-purple-600" : "border-gray-200"}`}
                        onClick={() => setCurrentMediaIndex(idx)}
                        aria-label={`Ver imagem ${idx + 1}`}
                      >
                        <img src={m.url} alt={property.title} className="w-full h-full object-contain bg-white" />
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
              <div className="flex gap-3 mb-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Camera size={16} />
                  {property.media?.length || 0} fotos
                </button>
                {property.latitude && property.longitude && (
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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

              <div className="flex items-start gap-4 mb-6">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {property.forRent ? "Aluguel" : "Venda"}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              </div>

              {property.property_type === "apartment" && property.condominium_id && (
                <div className="flex items-center gap-2 mb-6 text-gray-700">
                  <Building size={18} className="text-purple-600" />
                  <span>Condomínio: </span>
                  <a href={`/condominiums/${property.condominium_id}`} className="text-primary hover:underline">
                    {condominiumInfo?.name || "Ver condomínio"}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold text-green-600">
                  {property.price}
                </div>
                <button 
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const phone = property.owner_phone || property.agent_phone;
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
                           <div className="font-bold text-lg">{property.area || 0} m²</div>
                           <div className="text-sm text-gray-500">Área</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <Bed size={24} className="text-purple-600" />
                         <div>
                           <div className="font-bold text-lg">{property.bedroom_count || 0} quartos</div>
                           <div className="text-sm text-gray-500">Dormitórios</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <Bath size={24} className="text-purple-600" />
                         <div>
                           <div className="font-bold text-lg">{property.bathroom_count || 0} banheiros</div>
                           <div className="text-sm text-gray-500">Banheiros</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <Car size={24} className="text-purple-600" />
                         <div>
                           <div className="font-bold text-lg">{property.garage_count || 0} vagas</div>
                           <div className="text-sm text-gray-500">Garagem</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <Home size={24} className="text-purple-600" />
                         <div>
                           <div className="font-bold text-lg">{property.suite_count || 0} suítes</div>
                           <div className="text-sm text-gray-500">Suítes</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 text-gray-700">
                         <Calendar size={24} className="text-purple-600" />
                         <div>
                           <div className="font-bold text-lg">{property.year_built || "N/A"}</div>
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

                                     {property.description && (
                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                       <p className="text-gray-700">{property.description}</p>
                     </div>
                   )}

                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                     <button 
                       className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
                       onClick={() => {
                         const phone = property.owner_phone || property.agent_phone;
                         if (phone) {
                           window.open(`tel:${phone}`, '_self');
                         }
                       }}
                     >
                       <Phone size={24} />
                       Contatar Agora
                     </button>
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
                       <p>{property.neighborhood}, {property.display_address}</p>
                       {property.postal_code && <p>CEP: {property.postal_code}</p>}
                     </div>
                   </div>

                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                     <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                       <Phone size={20} className="text-purple-600" />
                       Contatos
                     </h3>
                     <div className="space-y-4">
                       {property.owner_name && (
                         <div>
                           <h4 className="font-medium text-gray-900 mb-2">Proprietário</h4>
                           <div className="space-y-1 text-sm text-gray-700">
                             <div className="flex items-center gap-2">
                               <User size={14} />
                               <span>{property.owner_name}</span>
                             </div>
                             {property.owner_phone && (
                               <div className="flex items-center gap-2">
                                 <Phone size={14} />
                                 <span>{property.owner_phone}</span>
                               </div>
                             )}
                             {property.owner_email && (
                               <div className="flex items-center gap-2">
                                 <Mail size={14} />
                                 <span>{property.owner_email}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {property.agent_name && (
                         <div>
                           <h4 className="font-medium text-gray-900 mb-2">Corretor</h4>
                           <div className="space-y-1 text-sm text-gray-700">
                             <div className="flex items-center gap-2">
                               <User size={14} />
                               <span>{property.agent_name}</span>
                             </div>
                             {property.agent_phone && (
                               <div className="flex items-center gap-2">
                                 <Phone size={14} />
                                 <span>{property.agent_phone}</span>
                               </div>
                             )}
                             {property.agent_email && (
                               <div className="flex items-center gap-2">
                                 <Mail size={14} />
                                 <span>{property.agent_email}</span>
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

                    <ContactForm
                      propertyId={property.public_id || property.listing_id || ""}
                      propertyTitle={property.title}
                    />
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
     </div>
   );
 } 