import { useEffect, useRef, useCallback } from "react";

export function useBackButtonRedirect(
  onBackAttempt: () => void,
  enabled: boolean = true
) {
  const hasShownPopup = useRef(false);
  const isEnabled = useRef(enabled);
  const historyStateAdded = useRef(false);
  const onBackAttemptRef = useRef(onBackAttempt);
  const isHandlingPopState = useRef(false);
  const shouldAllowBack = useRef(false);
  const fakeStatesCount = useRef(0);

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

    if (hasShownPopup.current) {
      return;
    }

    if (!historyStateAdded.current) {
      try {
        window.history.pushState({ preventBack: true }, "", window.location.href);
        historyStateAdded.current = true;
        fakeStatesCount.current = 1;
      } catch {
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (shouldAllowBack.current) {
        return;
      }

      if (isHandlingPopState.current) {
        return;
      }

      if (!isEnabled.current || hasShownPopup.current) {
        return;
      }

      const state = event.state;
      if (state && typeof state === "object" && "preventBack" in state) {
        return;
      }

      isHandlingPopState.current = true;
      
      try {
        window.history.pushState({ preventBack: true }, "", window.location.href);
        historyStateAdded.current = true;
        fakeStatesCount.current += 1;
      } catch {
      }

      hasShownPopup.current = true;
      onBackAttemptRef.current();
      
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    const handlePopStateRef = handlePopState;
    window.addEventListener("popstate", handlePopStateRef, { passive: true });

    return () => {
      window.removeEventListener("popstate", handlePopStateRef);
    };
  }, [enabled]);

  const dismissPopup = useCallback(() => {
    hasShownPopup.current = true;
    isEnabled.current = false;
    shouldAllowBack.current = true;
    
    if (typeof window !== "undefined" && historyStateAdded.current && fakeStatesCount.current > 0) {
      const totalStatesToGoBack = fakeStatesCount.current;
      try {
        window.history.go(-totalStatesToGoBack);
        historyStateAdded.current = false;
        fakeStatesCount.current = 0;
      } catch {
        historyStateAdded.current = false;
        fakeStatesCount.current = 0;
      }
    }
  }, []);

  const hasShown = useCallback(() => {
    return hasShownPopup.current;
  }, []);

  return {
    dismissPopup,
    hasShown,
  };
}

