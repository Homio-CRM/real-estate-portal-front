import { Ruler, Building, Calendar, MapPin, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { CondominiumCard as CondominiumCardType } from "../types/listings";

interface FeaturedCondominiumCardProps extends CondominiumCardType {
  className?: string;
}

export default function FeaturedCondominiumCard(props: FeaturedCondominiumCardProps) {
  const router = useRouter();
  const {
    name,
    display_address,
    min_area,
    max_area,
    image,
    total_units,
    year_built,
    description,
    id,
    className = "",
  } = props;

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

  

  return (
    <div 
      className={`group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="w-full h-64 relative overflow-hidden">
          {image && image !== "/placeholder-property.jpg" ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Building size={48} className="text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
              <Tag size={12} />
              LANÇAMENTO
            </span>
          </div>
          
          
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
            <MapPin size={14} />
            <span>{display_address}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Ruler size={14} />
            <span>{formatArea()}</span>
          </div>
          {total_units && (
            <div className="flex items-center gap-1">
              <Building size={14} />
              <span>{total_units} unidades</span>
            </div>
          )}
          {year_built && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{year_built}</span>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
