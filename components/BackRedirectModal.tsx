"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import HorizontalPropertyCard from "./HorizontalPropertyCard";
import { PropertyCard as PropertyCardType } from "../types/listings";

interface BackRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  suggestedProperties: PropertyCardType[];
}

export default function BackRedirectModal({
  isOpen,
  onClose,
  onContinue,
  suggestedProperties,
}: BackRedirectModalProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isOpen) {
    return null;
  }

  const displayProperties = suggestedProperties.slice(0, 3);

  if (displayProperties.length === 0) {
    onContinue();
    return null;
  }

  const modal = createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none sm:rounded-lg shadow-xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between z-10 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 pr-2 sm:pr-0 flex-1">
            Antes de sair, que tal ver estes imóveis?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Fechar"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Encontramos alguns imóveis que podem interessar você:
          </p>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {displayProperties.map((property) => (
              <HorizontalPropertyCard key={property.listing_id} {...property} />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
          >
            Continuar navegando
          </button>
          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base"
          >
            Voltar mesmo assim
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return modal;
}

