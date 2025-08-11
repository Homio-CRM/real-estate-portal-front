import { useState, useEffect, useCallback, useRef } from "react";
import { Location } from "./locationUtils";
import { propertyCache } from "./propertyCache";

export function useLocationRedirect() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const hasInitialized = useRef(false);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      // console.log("Geolocalização não é suportada pelo navegador");
      const defaultLocation: Location = {
        lat: -20.2976,
        lng: -40.2958
      };
      setUserLocation(defaultLocation);
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // console.log("Localização obtida:", location);
      setUserLocation(location);
      localStorage.setItem("userLocation", JSON.stringify(location));
      
      // Pré-carregar imóveis em background
      propertyCache.preloadProperties(location);
      
      return true;
    } catch (error) {
      // console.log("Erro ao obter localização:", error);
      const defaultLocation: Location = {
        lat: -20.2976,
        lng: -40.2958
      };
      setUserLocation(defaultLocation);
      
      // Pré-carregar imóveis com localização padrão
      propertyCache.preloadProperties(defaultLocation);
      
      return false;
    }
  }, []);

  const triggerPopup = useCallback(() => {
    // console.log("=== TRIGGER POPUP ===");
    // console.log("userLocation:", userLocation);
    
    if (userLocation) {
      // console.log("✅ MOSTRANDO POPUP!");
      setShowPopup(true);
      return true;
    } else {
      // console.log("❌ Não pode mostrar popup - userLocation não existe");
    }
    return false;
  }, [userLocation]);

  // Inicializar localização primeiro
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // console.log("🚀 Inicializando sistema de localização...");

    const savedLocation = localStorage.getItem("userLocation");
    
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        // console.log("📍 Localização carregada do cache:", location);
        setUserLocation(location);
        
        // Pré-carregar imóveis com localização do cache
        propertyCache.preloadProperties(location);
      } catch (error) {
        // console.log("❌ Erro ao carregar localização salva:", error);
        const defaultLocation: Location = {
          lat: -20.2976,
          lng: -40.2958
        };
        setUserLocation(defaultLocation);
        
        // Pré-carregar imóveis com localização padrão
        propertyCache.preloadProperties(defaultLocation);
      }
    } else {
      // console.log("🔍 Solicitando permissão de localização...");
      requestLocationPermission();
    }
  }, []);

  // Configurar event listeners após localização estar pronta
  useEffect(() => {
    if (!userLocation) {
      // console.log("⏳ Aguardando localização para configurar listeners...");
      return;
    }

    // console.log("🎯 Configurando event listeners com localização:", userLocation);

    // REMOVIDO: handleBeforeUnload que causava mensagem de confirmação
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   console.log("🔄 Beforeunload triggered");
    //   if (triggerPopup()) {
    //     event.preventDefault();
    //     event.returnValue = "";
    //     return "";
    //   }
    // };

    // const handleVisibilityChange = () => {
    //   console.log("👁️ Visibility change:", document.visibilityState);
    //   if (document.visibilityState === "hidden") {
    //     triggerPopup();
    //   }
    // };

    // const handleMouseLeave = (event: MouseEvent) => {
    //   console.log("🖱️ Mouse leave:", event.clientY);
    //   if (event.clientY <= 0) {
    //     triggerPopup();
    //   }
    // };

    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if (event.key === "Escape") {
    //     console.log("⌨️ ESC pressed");
    //     triggerPopup();
    //   }
    // };

    // REMOVIDO: window.addEventListener("beforeunload", handleBeforeUnload);
    // document.addEventListener("visibilitychange", handleVisibilityChange);
    // document.addEventListener("mouseleave", handleMouseLeave);
    // document.addEventListener("keydown", handleKeyDown);

    // console.log("✅ Event listeners configurados (sem beforeunload)");

    return () => {
      // REMOVIDO: window.removeEventListener("beforeunload", handleBeforeUnload);
      // document.removeEventListener("visibilitychange", handleVisibilityChange);
      // document.removeEventListener("mouseleave", handleMouseLeave);
      // document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userLocation, triggerPopup]);

  const closePopup = useCallback(() => {
    // console.log("❌ Fechando popup");
    setShowPopup(false);
  }, []);

  // Debug: mostrar estado atual
  useEffect(() => {
    // console.log("📊 Estado atual:", {
    //   userLocation,
    //   showPopup,
    //   hasInitialized: hasInitialized.current
    // });
  }, [userLocation, showPopup]);

  return {
    userLocation,
    showPopup,
    closePopup,
    requestLocationPermission,
    triggerPopup
  };
}