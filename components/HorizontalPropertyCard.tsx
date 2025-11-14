"use client";

import { Bed, Bath, Car, Ruler, Phone, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PropertyCard as PropertyCardType } from "../types/listings";
import { useState, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { translatePropertyType } from "../lib/propertyTypes";
import { formatCurrency } from "../lib/formatCurrency";
import ContactForm from "./ContactForm";
import { getStateAbbreviationById } from "../lib/brazilianStates";

export default function HorizontalPropertyCard(props: PropertyCardType) {
  const router = useRouter();
  const {
    title,
    address,
    area,
    price,
    image,
    bathroom_count,
    bedroom_count,
    garage_count,
    property_type,
    listing_id,
    media,
    list_price_amount,
    condominium_id,
    neighborhood,
    city_id,
    state_id,
  } = props;

  const [cityName, setCityName] = useState<string | null>(null);

  const toSentenceCase = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchCityName = async () => {
      if (city_id && !cityName) {
        try {
          const response = await fetch(`/api/cities?id=${city_id}`);
          if (response.ok) {
            const city = await response.json();
            if (city?.name) {
              setCityName(city.name);
            }
          }
        } catch {
        }
      }
    };

    fetchCityName();
  }, [city_id, cityName]);

  const formatAddress = (): string => {
    const parts: string[] = [];

    if (neighborhood) {
      parts.push(toSentenceCase(neighborhood));
    }

    if (city_id && cityName) {
      parts.push(toSentenceCase(cityName));
    }

    if (state_id) {
      const stateAbbrev = getStateAbbreviationById(state_id);
      if (stateAbbrev) {
        parts.push(stateAbbrev.toUpperCase());
      }
    }

    return parts.length > 0 ? parts.join(", ") : address || "Endereço não informado";
  };

  const translatedPropertyType = translatePropertyType(String(property_type || ""));

  const images = media && media.length > 0
    ? media.map((m) => m.url).filter((url): url is string => url !== undefined && url !== null)
    : image ? [image] : [];
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [computedListingUrl, setComputedListingUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const dealType: "rent" | "sale" = props.forRent ? "rent" : "sale";
  const propertyPriceAmount = props.list_price_amount ?? props.rental_price_amount ?? null;
  const propertyPublicId = props.public_id ?? props.listing_id ?? "";


  const displayedImage = images[currentImageIdx] ?? "/placeholder-property.jpg";

  const handlePreviousImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const priceFormatted = formatCurrency(list_price_amount ?? price);

  const handleCardClick = () => {
    if (listing_id) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`listing_${listing_id}`, JSON.stringify(props));
      }
      router.push(`/listings/${listing_id}`);
    }
  };

  const handleViewDetails = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (listing_id) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`listing_${listing_id}`, JSON.stringify(props));
      }
      router.push(`/listings/${listing_id}`);
    }
  };

  const handleContact = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowContactModal(true);
  };

  useEffect(() => {
    if (!listing_id) {
      setComputedListingUrl(null);
      return;
    }

    if (typeof window !== "undefined") {
      const absolute = new URL(`/listings/${listing_id}`, window.location.origin).toString();
      setComputedListingUrl(absolute);
      return;
    }

    setComputedListingUrl(`/listings/${listing_id}`);
  }, [listing_id]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const contactModal = isClient && showContactModal
    ? createPortal(
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowContactModal(false)}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Entre em contato</h2>
            <button
              onClick={() => setShowContactModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <ContactForm
            propertyId={listing_id?.toString()}
            propertyPublicId={propertyPublicId}
            propertyUrl={computedListingUrl ?? (listing_id ? `/listings/${listing_id}` : undefined)}
            propertyPrice={propertyPriceAmount}
            dealType={dealType}
          />
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <div
        className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onClick={handleCardClick}
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="w-full lg:w-80 h-64 lg:h-72 relative overflow-hidden flex-shrink-0">
            {displayedImage && displayedImage !== "/placeholder-property.jpg" ? (
              <img
                src={displayedImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            {images.length > 1 && (
              <>
                <button
                  aria-label="Imagem anterior"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  aria-label="Próxima imagem"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  onClick={handleNextImage}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>

              <div className="mb-3">
                <span className="text-xs text-gray-500">
                  {translatedPropertyType} em{" "}
                </span>
                <span className="text-xs text-gray-600">
                  {formatAddress()}
                </span>
              </div>

              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                {area && area > 0 && (
                  <span className="flex items-center gap-1">
                    <Ruler size={16} />
                    {area} m²
                  </span>
                )}
                {bedroom_count && bedroom_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Bed size={16} />
                    {bedroom_count}
                  </span>
                )}
                {bathroom_count && bathroom_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Bath size={16} />
                    {bathroom_count}
                  </span>
                )}
                {garage_count && garage_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Car size={16} />
                    {garage_count}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap truncate">
                {priceFormatted}
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleViewDetails}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap text-center"
                >
                  Ver detalhes
                </button>
                <button
                  onClick={handleContact}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                >
                  <Phone size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Entrar em contato</span>
                  <span className="sm:hidden">Contato</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {contactModal}
    </>
  );
} 