"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight } from "lucide-react";

type DetailMediaItem = {
  id?: string | number;
  url: string;
  caption?: string | null;
  is_primary?: boolean;
};

type DetailMediaCarouselProps = {
  media?: DetailMediaItem[] | null;
  title?: string | null;
  onImageClick?: () => void;
  onBack?: () => void;
  heightClassName?: string;
};

export function DetailMediaCarousel({
  media,
  title,
  onImageClick,
  onBack,
  heightClassName = "h-[320px] md:h-[600px]",
}: DetailMediaCarouselProps) {
  const router = useRouter();
  const items = Array.isArray(media) ? media : [];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  };

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
  }, [items.length]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollIncrement = el.clientWidth * 0.9;
    const offset = direction === "left" ? -scrollIncrement : scrollIncrement;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (items.length === 0) {
    return (
      <div className={`relative bg-white ${heightClassName}`}>
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <Camera size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Sem fotos disponíveis</p>
            <p className="text-gray-500 text-sm">Imagem não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${heightClassName}`}>
      <button
        onClick={handleBack}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg shadow-sm border border-gray-200"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {items.length > 1 && (
        <>
          <button
            aria-label="Imagem anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-40"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="Próxima imagem"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-40"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
            <Camera size={14} />
            {items.length} fotos
          </div>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex h-full overflow-x-scroll snap-x snap-mandatory gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((mediaItem, idx) => (
          <div
            key={mediaItem.id ?? `${mediaItem.url}-${idx}`}
            className="relative cursor-pointer overflow-hidden group flex-shrink-0 h-full w-full snap-center md:max-w-[70%] lg:max-w-[50%]"
            onClick={onImageClick}
          >
            <img
              src={mediaItem.url}
              alt={title ?? `Imagem ${idx + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}


