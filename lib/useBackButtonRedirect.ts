import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useBackButtonRedirect(
  onBackAttempt: () => void,
  enabled: boolean = true
) {
  const router = useRouter();
  const hasShownPopup = useRef(false);
  const isEnabled = useRef(enabled);
  const historyStateAdded = useRef(false);
  const onBackAttemptRef = useRef(onBackAttempt);
  const isHandlingPopState = useRef(false);

  useEffect(() => {
    onBackAttemptRef.current = onBackAttempt;
  }, [onBackAttempt]);

  useEffect(() => {
    isEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    if (!historyStateAdded.current) {
      try {
        window.history.pushState(null, "", window.location.href);
        historyStateAdded.current = true;
      } catch (error) {
      }
    }

    const handlePopState = () => {
      if (isHandlingPopState.current) {
        return;
      }

      if (!isEnabled.current || hasShownPopup.current) {
        return;
      }

      isHandlingPopState.current = true;
      
      try {
        window.history.pushState(null, "", window.location.href);
      } catch (error) {
      }

      hasShownPopup.current = true;
      onBackAttemptRef.current();
      
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled]);

  const allowNavigation = useCallback(() => {
    hasShownPopup.current = true;
    historyStateAdded.current = false;
    router.back();
  }, [router]);

  const dismissPopup = useCallback(() => {
    hasShownPopup.current = true;
  }, []);

  return {
    allowNavigation,
    dismissPopup,
    reset: () => {
      hasShownPopup.current = false;
    },
  };
}

