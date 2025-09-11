import { useState, useEffect, useCallback, useRef } from "react";
import { Location } from "./locationUtils";
import { getUserLocation } from "./userLocation";

export function useLocationRedirect() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const hasInitialized = useRef(false);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
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

      setUserLocation(location);
      localStorage.setItem("userLocation", JSON.stringify(location));
      
      return true;
    } catch {
      const defaultLocation: Location = {
        lat: -20.2976,
        lng: -40.2958
      };
      setUserLocation(defaultLocation);
      
      return false;
    }
  }, []);

  const triggerPopup = useCallback(() => {
    
    if (userLocation) {
      setShowPopup(true);
      return true;
    } else {
    }
    return false;
  }, [userLocation]);

  // Inicializar localização primeiro
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeLocation = async () => {
      const savedLocation = localStorage.getItem("userLocation");
      
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          setUserLocation(location);
          return;
        } catch {
          // Se o localStorage estiver corrompido, continuar com IP
        }
      }

      // Primeiro tentar obter localização por IP (sem permissão)
      try {
        const ipLocation = await getUserLocation();
        if (ipLocation.lat && ipLocation.lng) {
          const location: Location = {
            lat: ipLocation.lat,
            lng: ipLocation.lng
          };
          setUserLocation(location);
          localStorage.setItem("userLocation", JSON.stringify(location));
          return;
        }
      } catch (error) {
        console.error("Erro ao obter localização por IP:", error);
      }

      // Se falhar, usar localização padrão (Vitória)
      const defaultLocation: Location = {
        lat: -20.2976,
        lng: -40.2958
      };
      setUserLocation(defaultLocation);
    };

    initializeLocation();
  }, []);

  // Configurar event listeners após localização estar pronta
  useEffect(() => {
    if (!userLocation) {
      return;
    }


    // REMOVIDO: handleBeforeUnload que causava mensagem de confirmação
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   if (triggerPopup()) {
    //     event.preventDefault();
    //     event.returnValue = "";
    //     return "";
    //   }
    // };

    // const handleVisibilityChange = () => {
    //   if (document.visibilityState === "hidden") {
    //     triggerPopup();
    //   }
    // };

    // const handleMouseLeave = (event: MouseEvent) => {
    //   if (event.clientY <= 0) {
    //     triggerPopup();
    //   }
    // };

    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if (event.key === "Escape") {
    //     triggerPopup();
    //   }
    // };

    // REMOVIDO: window.addEventListener("beforeunload", handleBeforeUnload);
    // document.addEventListener("visibilitychange", handleVisibilityChange);
    // document.addEventListener("mouseleave", handleMouseLeave);
    // document.addEventListener("keydown", handleKeyDown);


    return () => {
      // REMOVIDO: window.removeEventListener("beforeunload", handleBeforeUnload);
      // document.removeEventListener("visibilitychange", handleVisibilityChange);
      // document.removeEventListener("mouseleave", handleMouseLeave);
      // document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userLocation, triggerPopup]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const requestPreciseLocation = useCallback(async () => {
    const success = await requestLocationPermission();
    if (success) {
      // Localização precisa obtida com sucesso
      return true;
    }
    return false;
  }, [requestLocationPermission]);

  // Debug: mostrar estado atual
  useEffect(() => {
  }, [userLocation, showPopup]);

  return {
    userLocation,
    showPopup,
    closePopup,
    requestLocationPermission,
    requestPreciseLocation,
    triggerPopup
  };
}