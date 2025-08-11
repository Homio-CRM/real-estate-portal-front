import { useState, useEffect } from "react";
import { propertyCache } from "./propertyCache";
import { Location } from "./locationUtils";

export function useTransactionType(userLocation: Location | null) {
  const [transactionType, setTransactionType] = useState<"sale" | "rent" | "all">("sale");

  const updateTransactionType = async (newType: "sale" | "rent" | "all") => {
    setTransactionType(newType);
    
    // Se temos localização do usuário, pré-carregar imóveis para o novo tipo
    if (userLocation) {
      await propertyCache.preloadProperties(userLocation, newType);
    }
  };

  // Pré-carregar imóveis quando a localização mudar
  useEffect(() => {
    if (userLocation) {
      propertyCache.preloadProperties(userLocation, transactionType);
    }
  }, [userLocation, transactionType]);

  return {
    transactionType,
    updateTransactionType
  };
} 