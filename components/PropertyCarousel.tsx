"use client";
import { useRef, useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import { PropertyCarouselProps } from "../types/components";
import { CAROUSEL_CONSTANTS, checkScroll, handleCarouselScroll } from "../lib/carousel";

export default function PropertyCarousel({ properties }: PropertyCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const repeated = [...properties, ...properties, ...properties];

  useEffect(() => {
    const checkScrollHandler = () => {
      checkScroll(carouselRef, setCanScrollLeft, setCanScrollRight);
    };
    
    const currentRef = carouselRef.current;
    checkScrollHandler();
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScrollHandler);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScrollHandler);
      }
    };
  }, [properties]);

  const handleScroll = (dir: "left" | "right") => {
    handleCarouselScroll(dir, carouselRef, canScrollRight);
  };

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: CAROUSEL_CONSTANTS.CARD_HEIGHT }}>
      {canScrollLeft && (
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background border border-border rounded-full shadow p-2"
          onClick={() => handleScroll("left")}
        >
          <span className="text-2xl">&#8592;</span>
        </button>
      )}
      <div
        ref={carouselRef}
        className="flex items-stretch gap-6 px-8 overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none"
        style={{ scrollSnapType: "x mandatory", height: CAROUSEL_CONSTANTS.CARD_HEIGHT }}
      >
        {repeated.map((property, idx) => (
          <div
            key={idx}
            style={{ 
              minWidth: CAROUSEL_CONSTANTS.CARD_WIDTH, 
              maxWidth: CAROUSEL_CONSTANTS.CARD_WIDTH, 
              height: CAROUSEL_CONSTANTS.CARD_HEIGHT, 
              scrollSnapAlign: "start" 
            }}
            className="flex items-stretch"
          >
            <PropertyCard {...property} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-10" style={{ height: CAROUSEL_CONSTANTS.CARD_HEIGHT, width: 48, background: "linear-gradient(to left, var(--background) 80%, transparent)" }} />
      {canScrollRight && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background border border-border rounded-full shadow p-2"
          onClick={() => handleScroll("right")}
        >
          <span className="text-2xl">&#8594;</span>
        </button>
      )}
    </div>
  );
} 