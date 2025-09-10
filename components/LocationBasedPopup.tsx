"use client";
import { useState, useEffect, useCallback } from "react";
import { X, MapPin, Phone, Bed, Bath, Car, Ruler } from "lucide-react";
import { PropertyCard } from "../types/listings";
import { Location } from "../lib/locationUtils";
import { propertyCache } from "../lib/propertyCache";

interface LocationBasedPopupProps {
  isVisible: boolean;
  onClose: () => void;
  userLocation: Location | null;
  transactionType?: "sale" | "rent" | "all";
}

export default function LocationBasedPopup({ 
  isVisible, 
  onClose, 
  userLocation,
  transactionType = "sale"
}: LocationBasedPopupProps) {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug: log props
  useEffect(() => {
    console.log("🎭 LocationBasedPopup props:", {
      isVisible,
      userLocation,
      loading
    });
  }, [isVisible, userLocation, loading]);

  useEffect(() => {
    if (isVisible && userLocation) {
      console.log("🚀 Popup visível, carregando propriedades do cache...");
      setLoading(true);
      
      // Usar cache se disponível, senão carregar
      if (propertyCache.isLoaded(userLocation, transactionType)) {
        const cachedProperties = propertyCache.getProperties(userLocation, transactionType);
        console.log("📦 Usando propriedades do cache:", cachedProperties.length);
        setProperties(cachedProperties);
        setLoading(false);
      } else {
        console.log("⏳ Cache não disponível, aguardando carregamento...");
        // Aguardar um pouco para o cache carregar
        const checkCache = () => {
          if (propertyCache.isLoaded(userLocation, transactionType)) {
            const cachedProperties = propertyCache.getProperties(userLocation, transactionType);
            console.log("✅ Cache carregado, usando propriedades:", cachedProperties.length);
            setProperties(cachedProperties);
            setLoading(false);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      }
    }
  }, [isVisible, userLocation, transactionType]);

  const getDistance = useCallback((property: PropertyCard) => {
    if (!userLocation || !property.latitude || !property.longitude) return null;
    
    const distance = Math.sqrt(
      Math.pow(userLocation.lat - property.latitude, 2) + 
      Math.pow(userLocation.lng - property.longitude, 2)
    ) * 111;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }, [userLocation]);

  console.log("🎭 LocationBasedPopup render - isVisible:", isVisible);

  if (!isVisible) {
    console.log("🎭 Popup não visível, retornando null");
    return null;
  }

  console.log("🎭 Renderizando popup");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-gray-900">
                Imóveis Sugeridos
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Que tal dar uma olhada nesses imóveis antes de sair?
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const distance = getDistance(property);
                return (
                  <div
                    key={property.listing_id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                                              window.location.href = `/listings/${property.listing_id}`;
                    }}
                  >
                    {/* Imagem */}
                    <div className="h-48 bg-gray-200 relative">
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin size={48} />
                        </div>
                      )}
                      {distance && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {distance}
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {property.neighborhood}, {property.display_address}
                      </p>

                      {/* Características */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ruler size={14} className="text-primary" />
                          <span>{property.area || 0} m²</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bed size={14} className="text-primary" />
                          <span>{property.bedroom_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bath size={14} className="text-primary" />
                          <span>{property.bathroom_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Car size={14} className="text-primary" />
                          <span>{property.garage_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone size={14} className="text-primary" />
                        <span>Contato: {property.key_location || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600 mb-2">Nenhum imóvel disponível no momento</p>
              <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sair do Site
            </button>
            <button
              onClick={() => {
                window.location.href = "/listings";
              }}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Mais Imóveis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}