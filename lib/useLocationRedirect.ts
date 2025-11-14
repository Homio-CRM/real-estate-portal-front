import { useState, useEffect, useCallback, useRef } from "react";
import { Location } from "./locationUtils";

const DEFAULT_LOCATION: Location = {
  lat: -20.2976,
  lng: -40.2958
};

function parseStoredLocation(value: string | null): Location | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function useLocationRedirect() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const hasInitialized = useRef(false);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
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
      setUserLocation(DEFAULT_LOCATION);
      return false;
    }
  }, []);

  const triggerPopup = useCallback(() => {
    if (!userLocation) {
      return false;
    }

    setShowPopup(true);
    return true;
  }, [userLocation]);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    const storedLocation = parseStoredLocation(localStorage.getItem("userLocation"));

    if (storedLocation) {
      setUserLocation(storedLocation);
      return;
    }

    void requestLocationPermission();
  }, [requestLocationPermission]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  return {
    userLocation,
    showPopup,
    closePopup,
    requestLocationPermission,
    triggerPopup
  };
}