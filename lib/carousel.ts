import { RefObject } from "react";

export const CAROUSEL_CONSTANTS = {
  CARD_WIDTH: 280,
  CARD_GAP: 24,
  CARD_HEIGHT: 320,
  VISIBLE_CARDS: 3.5,
  SCROLL_CARDS: 4,
} as const;

export function checkScroll(
  carouselRef: RefObject<HTMLDivElement | null>,
  setCanScrollLeft: (value: boolean) => void,
  setCanScrollRight: (value: boolean) => void
) {
  if (!carouselRef.current) return;
  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
  setCanScrollLeft(scrollLeft > 0);
  setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
}

export function handleCarouselScroll(
  dir: "left" | "right",
  carouselRef: RefObject<HTMLDivElement | null>,
  canScrollRight: boolean
) {
  if (!carouselRef.current) return;
  const scrollAmount = CAROUSEL_CONSTANTS.SCROLL_CARDS * (CAROUSEL_CONSTANTS.CARD_WIDTH + CAROUSEL_CONSTANTS.CARD_GAP);
  
  if (dir === "right") {
    if (!canScrollRight) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  } else {
    carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }
} 