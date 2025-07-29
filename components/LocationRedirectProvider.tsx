"use client";
import { ReactNode } from "react";
import { useLocationRedirect } from "../lib/useLocationRedirect";
import LocationBasedPopup from "./LocationBasedPopup";

interface LocationRedirectProviderProps {
  children: ReactNode;
}

export default function LocationRedirectProvider({ children }: LocationRedirectProviderProps) {
  const { userLocation, showPopup, closePopup } = useLocationRedirect();

  return (
    <>
      {children}
      <LocationBasedPopup
        isVisible={showPopup}
        onClose={closePopup}
        userLocation={userLocation}
      />
    </>
  );
}