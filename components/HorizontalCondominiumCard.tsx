"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { Bed, Bath, Car, Ruler, Phone, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CondominiumCard as CondominiumCardType } from "../types/listings";
import { translatePropertyType } from "../lib/propertyTypes";
import { formatCurrency } from "../lib/formatCurrency";
import ContactForm from "./ContactForm";
import { getStateAbbreviationById } from "../lib/brazilianStates";
import { cleanHtmlText } from "../lib/utils";
import { createPortal } from "react-dom";

export default function HorizontalCondominiumCard(props: CondominiumCardType) {
  const router = useRouter();
  const {
    name,
    neighborhood,
    city_id,
    city_name,
    state_id,
    display_address,
    min_area,
    max_area,
    min_room_amount,
    max_room_amount,
    min_bathroom_count,
    max_bathroom_count,
    min_garage_count,
    max_garage_count,
    min_price,
    max_price,
    image,
    media,
    id,
    description,
  } = props;

  const [cityName, setCityName] = useState<string | null>(city_name ?? null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [computedCondoUrl, setComputedCondoUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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

  useEffect(() => {
    if (!id) {
      setComputedCondoUrl(null);
      return;
    }

    if (typeof window !== "undefined") {
      const absolute = new URL(`/condominiums/${id}`, window.location.origin).toString();
      setComputedCondoUrl(absolute);
      return;
    }

    setComputedCondoUrl(`/condominiums/${id}`);
  }, [id]);

  const toSentenceCase = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const stateAbbrev = state_id ? getStateAbbreviationById(state_id) : null;

  const formatAddress = (): string => {
    const parts: string[] = [];

    if (neighborhood) {
      parts.push(toSentenceCase(neighborhood));
    }

    if (cityName) {
      parts.push(toSentenceCase(cityName));
    }

    if (stateAbbrev) {
      parts.push(stateAbbrev.toUpperCase());
    }

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return display_address || "Endereço não informado";
  };

  const images = media && media.length > 0
    ? media.map((item) => item.url).filter((url): url is string => Boolean(url))
    : image
      ? [image]
      : [];

  const displayedImage = images[currentImageIdx] ?? "/placeholder-property.jpg";

  const formatAreaRange = () => {
    if (min_area && max_area) {
      if (min_area === max_area) {
        return `${min_area} m²`;
      }
      return `${min_area} - ${max_area} m²`;
    }
    if (min_area) {
      return `A partir de ${min_area} m²`;
    }
    if (max_area) {
      return `Até ${max_area} m²`;
    }
    return null;
  };

  const formatRange = (minValue?: number | null, maxValue?: number | null) => {
    const min = typeof minValue === "number" && minValue > 0 ? minValue : null;
    const max = typeof maxValue === "number" && maxValue > 0 ? maxValue : null;

    if (min && max) {
      if (min === max) {
        return `${min}`;
      }
      return `${min}-${max}`;
    }

    if (min) {
      return `${min}+`;
    }

    if (max) {
      return `${max}`;
    }

    return null;
  };

  const bedroomText = formatRange(min_room_amount, max_room_amount);
  const bathroomText = formatRange(min_bathroom_count, max_bathroom_count);
  const garageText = formatRange(min_garage_count, max_garage_count);
  const areaText = formatAreaRange();

  const normalizePrice = (value?: number | null) => {
    if (typeof value !== "number") {
      return null;
    }
    if (value >= 1000000) {
      return value / 100;
    }
    if (value < 10000) {
      return value * 100;
    }
    return value;
  };

  const priceMin = normalizePrice(min_price);
  const priceMax = normalizePrice(max_price);

  const formatPriceRange = () => {
    if (priceMin !== null && priceMax !== null && priceMin === priceMax) {
      return formatCurrency(priceMin);
    }

    if (priceMin !== null && priceMax !== null) {
      return `${formatCurrency(priceMin)} - ${formatCurrency(priceMax)}`;
    }

    if (priceMin !== null) {
      return `A partir de ${formatCurrency(priceMin)}`;
    }

    if (priceMax !== null) {
      return `Até ${formatCurrency(priceMax)}`;
    }

    return "Preço sob consulta";
  };

  const translatedPropertyType = translatePropertyType("condominium");
  const dealType = "launch" as const;
  const propertyPriceAmount = priceMin ?? priceMax ?? null;
  const propertyPublicId =
    (props as unknown as { public_id?: string })?.public_id ??
    id ??
    "";

  const handleCardClick = () => {
    if (id) {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`condominium_${id}`, JSON.stringify(props));
        } catch {
        }
      }
      router.push(`/condominiums/${id}`);
    }
  };

  const handleViewDetails = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleCardClick();
  };

  const handleContact = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowContactModal(true);
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
          onClick={(event) => event.stopPropagation()}
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
            propertyId={id?.toString()}
            propertyPublicId={propertyPublicId}
            propertyUrl={computedCondoUrl ?? (id ? `/condominiums/${id}` : undefined)}
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
          <div className="w-full lg:w-80 h-60 lg:h-auto lg:min-h-full relative overflow-hidden flex-shrink-0">
          {displayedImage && displayedImage !== "/placeholder-property.jpg" ? (
            <img
              src={displayedImage}
              alt={name}
              className="block w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              {name}
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
              {areaText && (
                <span className="flex items-center gap-1">
                  <Ruler size={16} />
                  {areaText}
                </span>
              )}
              {bedroomText && (
                <span className="flex items-center gap-1">
                  <Bed size={16} />
                  {bedroomText}
                </span>
              )}
              {bathroomText && (
                <span className="flex items-center gap-1">
                  <Bath size={16} />
                  {bathroomText}
                </span>
              )}
              {garageText && (
                <span className="flex items-center gap-1">
                  <Car size={16} />
                  {garageText}
                </span>
              )}
            </div>

            {description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {cleanHtmlText(description)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap truncate">
              {formatPriceRange()}
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