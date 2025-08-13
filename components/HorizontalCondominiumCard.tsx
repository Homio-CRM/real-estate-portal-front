import { Ruler, Phone, Camera, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { CondominiumCard as CondominiumCardType } from "../types/listings";
import { translatePropertyType } from "../lib/propertyTypes";

export default function HorizontalCondominiumCard(props: CondominiumCardType) {
  const router = useRouter();
  const {
    name,
    display_address,
    min_area,
    max_area,
    min_price,
    max_price,
    image,
    total_units,
    year_built,
    description,
    id,
  } = props;

  const translatedPropertyType = translatePropertyType("condominium");

  const handleCardClick = () => {
    if (id) {
      router.push(`/condominiums/${id}`);
    }
  };

  const formatArea = () => {
    if (min_area && max_area) {
      if (min_area === max_area) {
        return `${min_area} m²`;
      }
      return `${min_area} - ${max_area} m²`;
    } else if (min_area) {
      return `A partir de ${min_area} m²`;
    }
    return "Área sob consulta";
  };

  const formatPrice = () => {
    const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    if (min_price && max_price) {
      if (min_price === max_price) {
        return formatCurrency(min_price);
      }
      return `${formatCurrency(min_price)} - ${formatCurrency(max_price)}`;
    } else if (min_price) {
      return `A partir de ${formatCurrency(min_price)}`;
    }
    return "Preço sob consulta";
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
              alt={name} 
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
                {translatedPropertyType} em{" "}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {display_address}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
            
            {description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
            )}
            
            <div className="flex gap-6 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Ruler size={16} />
                {formatArea()}
              </span>
              {total_units && (
                <span className="flex items-center gap-1">
                  <Building size={16} />
                  {total_units} unidades
                </span>
              )}
              {year_built && (
                <span className="flex items-center gap-1">
                  <span className="text-xs">Ano</span>
                  {year_built}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice()}
              </span>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Phone size={16} />
              <span className="text-sm font-medium">Contatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 