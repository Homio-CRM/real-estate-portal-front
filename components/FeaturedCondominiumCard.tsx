"use client";

import {
  Ruler,
  Building,
  Calendar,
  MapPin,
  Tag,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CondominiumCard as CondominiumCardType } from "../types/listings";
import { useEffect, useState, type MouseEvent } from "react";

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
    media,
    total_units,
    year_built,
    description,
    id,
    className = "",
  } = props;

  const images = media && media.length > 0
    ? media.map((item) => item.url).filter((url): url is string => typeof url === "string" && url.length > 0)
    : image
      ? [image]
      : [];
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIdx(0);
      return;
    }
    if (currentImageIdx >= images.length) {
      setCurrentImageIdx(0);
    }
  }, [images.length, currentImageIdx]);

  const displayedImage = images[currentImageIdx] ?? "/placeholder-property.jpg";

  const handleCardClick = () => {
    if (!id) {
      return;
    }

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`condominium_${id}`, JSON.stringify(props));
      } catch {
      }
    }

    router.push(`/condominiums/${id}`);
  };

  const handlePreviousImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const formatArea = () => {
    if (min_area && max_area) {
      if (min_area === max_area) {
        return `${min_area} m²`;
      }
      return `${min_area} - ${max_area} m²`;
    }
    if (min_area) {
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
          {displayedImage && displayedImage !== "/placeholder-property.jpg" ? (
            <img
              src={displayedImage}
              alt={name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Camera size={40} className="text-gray-300" />
            </div>
          )}

          {images.length > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
              {currentImageIdx + 1}/{images.length}
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                onClick={handlePreviousImage}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                onClick={handleNextImage}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
              <Tag size={12} />
              LANÇAMENTO
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col min-h-[200px]">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{display_address}</span>
            </div>
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-4">
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
      </div>
    </div>
  );
}
