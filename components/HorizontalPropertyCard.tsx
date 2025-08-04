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
      router.push(`/listings/${listing_id}`);
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