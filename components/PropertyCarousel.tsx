"use client";
import { useRef, useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";

type Property = {
  title: string;
  address: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: string;
  iptu?: string;
  image: string;
  forRent?: boolean;
};

type PropertyCarouselProps = {
  properties: Property[];
};

const CARD_WIDTH = 280; // px
const CARD_GAP = 24; // px
const CARD_HEIGHT = 320; // px
const VISIBLE_CARDS = 3.5;
const SCROLL_CARDS = 4;

export default function PropertyCarousel({ properties }: PropertyCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const repeated = [...properties, ...properties, ...properties];

  useEffect(() => {
    const checkScroll = () => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };
    checkScroll();
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scroll", checkScroll);
    }
    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener("scroll", checkScroll);
      }
    };
  }, [properties]);

  const handleScroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = SCROLL_CARDS * (CARD_WIDTH + CARD_GAP);
    if (dir === "right") {
      if (!canScrollRight) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: CARD_HEIGHT }}>
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
        style={{ scrollSnapType: "x mandatory", height: CARD_HEIGHT }}
      >
        {repeated.map((property, idx) => (
          <div
            key={idx}
            style={{ minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH, height: CARD_HEIGHT, scrollSnapAlign: "start" }}
            className="flex items-stretch"
          >
            <PropertyCard {...property} />
          </div>
        ))}
      </div>
      {/* Fade direito */}
      <div className="pointer-events-none absolute right-0 top-0 z-10" style={{ height: CARD_HEIGHT, width: 48, background: "linear-gradient(to left, var(--background) 80%, transparent)" }} />
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