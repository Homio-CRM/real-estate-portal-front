import { Bed, Bath, Car, Ruler, Phone, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropertyCard as PropertyCardType } from "../types/listings";
import { useState, type MouseEvent } from "react";
import { translatePropertyType } from "../lib/propertyTypes";
import { formatCurrency } from "../lib/formatCurrency";
import Image from "next/image";

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
    media,
    list_price_amount,
    iptu_amount,
  } = props;

  const translatedPropertyType = translatePropertyType(String(property_type || ""));

  const images = media && media.length > 0 
    ? media.map((m) => m.url).filter((url): url is string => url !== undefined && url !== null) 
    : image ? [image] : [];
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const displayedImage = images[currentImageIdx] ?? "/placeholder-property.jpg";

  const handleImageChange = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }
  };

  const priceFormatted = formatCurrency(list_price_amount ?? price);
  const iptuFormatted = iptu_amount ? formatCurrency(iptu_amount) : iptu ? formatCurrency(iptu) : undefined;

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
        <div className="w-full lg:w-80 h-48 sm:h-56 lg:h-64 relative">
          {displayedImage && displayedImage !== "/placeholder-property.jpg" ? (
            <Image
              src={displayedImage}
              alt={title || "Property image"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
          )}
          {images.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              {currentImageIdx + 1}/{images.length}
            </div>
          )}
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            onClick={handleImageChange}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
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
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600 mb-4">
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
          
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {priceFormatted}
              </div>
              {iptuFormatted && (
                <div className="text-xs text-gray-500">IPTU: {iptuFormatted}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
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