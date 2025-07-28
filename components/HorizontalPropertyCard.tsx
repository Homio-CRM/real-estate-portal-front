import { Bed, Bath, Car, Ruler, Phone, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropertyCard as PropertyCardType } from "../types/listings";

function translatePropertyType(propertyType: string): string {
  const translations: { [key: string]: string } = {
    "apartment": "Apartamento",
    "house": "Casa",
    "kitnet": "Kitnet",
    "loft": "Loft",
    "cobertura": "Cobertura",
    "casa_geminada": "Casa Geminada",
    "terreno": "Terreno",
    "comercial": "Comercial",
    "escritorio": "Escritório",
    "loja": "Loja",
    "galpao": "Galpão"
  };
  
  return translations[propertyType.toLowerCase()] || propertyType;
}

export default function HorizontalPropertyCard(props: PropertyCardType) {
  const router = useRouter();
  const {
    title,
    address,
    area,
    price,
    iptu,
    image,
    forRent,
    bathroom_count,
    bedroom_count,
    garage_count,
    property_type,
    listing_id,
  } = props;

  const translatedPropertyType = translatePropertyType(property_type);

  const handleCardClick = () => {
    if (listing_id) {
      router.push(`/imovel/${listing_id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-80 h-64 relative">
          {image && image !== "/placeholder-property.jpg" ? (
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
          )}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-600">
                {translatedPropertyType} para {forRent ? "alugar" : "comprar"} em{" "}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {address}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{title}</p>
            
            <div className="flex gap-6 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Ruler size={16} />
                {area ?? 0} m²
              </span>
              <span className="flex items-center gap-1">
                <Bed size={16} />
                {bedroom_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Bath size={16} />
                {bathroom_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Car size={16} />
                {garage_count ?? 0}
              </span>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {price}
              </div>
              {iptu && (
                <div className="text-xs text-gray-500">
                  IPTU: {iptu}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone size={16} />
                Contatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 