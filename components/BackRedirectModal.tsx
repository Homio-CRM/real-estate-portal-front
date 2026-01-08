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
        className="bg-white rounded-none sm:rounded-xl shadow-md border border-gray-200 max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 sm:py-6 flex items-center justify-between z-10 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-4 flex-1">
            Antes de sair, que tal ver estes imóveis?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-base text-gray-600 mb-6">
            Encontramos alguns imóveis que podem interessar você:
          </p>

          <div className="space-y-4">
            {displayProperties.map((property) => (
              <HorizontalPropertyCard key={property.listing_id} {...property} />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 sm:py-6 flex flex-col gap-3 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-base"
          >
            Continuar navegando
          </button>
          <button
            onClick={onContinue}
            className="w-full px-6 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base border border-gray-200"
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

