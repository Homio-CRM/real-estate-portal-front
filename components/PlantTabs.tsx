"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bed, Bath, Car, Ruler, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { PropertyCard } from "../types/listings";
import { cleanHtmlText } from "../lib/utils";
import { ImageGallery } from "./ImageGallery";

interface PlantTabsProps {
  plants: PropertyCard[];
}

export default function PlantTabs({ plants }: PlantTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activePlant = plants && plants.length > 0 ? plants[activeTab] : null;
  const images = activePlant && activePlant.media && activePlant.media.length > 0
    ? activePlant.media.map((m) => m.url).filter((url): url is string => url !== undefined && url !== null)
    : activePlant && activePlant.image ? [activePlant.image] : [];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTab]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    
    if (images.length > 0) {
      const imageWidth = el.clientWidth;
      const newIndex = Math.round(el.scrollLeft / imageWidth);
      setCurrentImageIndex(Math.min(newIndex, images.length - 1));
    }
  }, [images.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    const handleResize = () => updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [images.length, activeTab, updateScrollState]);

  if (!plants || plants.length === 0) {
    return null;
  }

  const activePlantSafe = plants[activeTab];
  const imagesSafe = activePlantSafe.media && activePlantSafe.media.length > 0
    ? activePlantSafe.media.map((m) => m.url).filter((url): url is string => url !== undefined && url !== null)
    : activePlantSafe.image ? [activePlantSafe.image] : [];

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const imageWidth = el.clientWidth;
    const targetIndex = direction === "left" 
      ? Math.max(0, currentImageIndex - 1)
      : Math.min(imagesSafe.length - 1, currentImageIndex + 1);
    
    el.scrollTo({ left: targetIndex * imageWidth, behavior: "smooth" });
    setCurrentImageIndex(targetIndex);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  const getPlantTitle = (plant: PropertyCard): string => {
    if (plant.title) {
      return plant.title;
    }
    const parts: string[] = [];
    if (plant.bedroom_count) {
      parts.push(`${plant.bedroom_count} quarto${plant.bedroom_count > 1 ? 's' : ''}`);
    }
    if (plant.area) {
      parts.push(`${plant.area} m²`);
    }
    return parts.length > 0 ? parts.join(' - ') : 'Planta';
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto no-scrollbar px-6">
          {plants.map((plant, index) => (
            <button
              key={plant.listing_id || index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === index
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {getPlantTitle(plant)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-0">
        <div className="space-y-6">
          <div className="relative">
            {imagesSafe.length > 0 ? (
              <div className="relative w-full h-[320px] bg-gray-50 overflow-hidden">
                <div
                  ref={scrollRef}
                  className="flex h-full overflow-x-scroll snap-x snap-mandatory gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {imagesSafe.map((imageUrl, idx) => (
                    <div
                      key={idx}
                      className="relative flex-shrink-0 h-full w-full snap-center cursor-pointer group overflow-hidden md:max-w-[70%] lg:max-w-[50%]"
                      onClick={() => handleImageClick(idx)}
                    >
                      <img
                        src={imageUrl}
                        alt={`${getPlantTitle(activePlantSafe)} - Imagem ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>

                {imagesSafe.length > 1 && (
                  <>
                    <button
                      aria-label="Imagem anterior"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScroll("left");
                      }}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      aria-label="Próxima imagem"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScroll("right");
                      }}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight size={22} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-lg">
                      <Camera size={14} />
                      {currentImageIndex + 1} / {imagesSafe.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[320px] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <Ruler size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Sem imagem disponível</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 px-6 pb-6">
            {activePlantSafe.description && (
              <div>
                <p className="text-gray-700 whitespace-pre-line">
                  {cleanHtmlText(activePlantSafe.description)}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 md:gap-10">
              {activePlantSafe.area && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Ruler size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.area} m²</div>
                    <div className="text-xs text-gray-500">Área</div>
                  </div>
                </div>
              )}

              {activePlantSafe.bedroom_count !== undefined && activePlantSafe.bedroom_count !== null && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Bed size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.bedroom_count}</div>
                    <div className="text-xs text-gray-500">Quarto{activePlantSafe.bedroom_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {activePlantSafe.bathroom_count !== undefined && activePlantSafe.bathroom_count !== null && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Bath size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.bathroom_count}</div>
                    <div className="text-xs text-gray-500">Banheiro{activePlantSafe.bathroom_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {activePlantSafe.garage_count !== undefined && activePlantSafe.garage_count !== null && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Car size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.garage_count}</div>
                    <div className="text-xs text-gray-500">Vaga{activePlantSafe.garage_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {activePlantSafe.suite_count !== undefined && activePlantSafe.suite_count !== null && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Bed size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.suite_count}</div>
                    <div className="text-xs text-gray-500">Suíte{activePlantSafe.suite_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {activePlantSafe.total_area && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Ruler size={22} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-base">{activePlantSafe.total_area} m²</div>
                    <div className="text-xs text-gray-500">Área Total</div>
                  </div>
                </div>
              )}
            </div>

            {activePlantSafe.price && activePlantSafe.price !== "Preço sob consulta" && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Preço</div>
                <div className="text-2xl font-bold text-primary">{activePlantSafe.price}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGallery && imagesSafe.length > 0 && (
        <ImageGallery
          mediaItems={imagesSafe.map((url, index) => ({
            id: `plant-${activePlantSafe.listing_id}-${index}`,
            url,
            caption: getPlantTitle(activePlantSafe),
            is_primary: index === currentImageIndex,
          }))}
          initialIndex={currentImageIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}

