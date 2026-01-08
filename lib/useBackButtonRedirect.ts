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
        fakeStatesCount.current = Math.max(0, fakeStatesCount.current - 1);
        if (fakeStatesCount.current <= 0) {
          shouldAllowBack.current = false;
          historyStateAdded.current = false;
          fakeStatesCount.current = 0;
        }
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

    window.addEventListener("popstate", handlePopState, { passive: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled]);

  const allowNavigation = useCallback(() => {
    hasShownPopup.current = true;
    shouldAllowBack.current = true;
    isEnabled.current = false;
    
    const cleanup = () => {
      shouldAllowBack.current = false;
      historyStateAdded.current = false;
      fakeStatesCount.current = 0;
      isEnabled.current = enabled;
    };
    
    if (typeof window !== "undefined" && historyStateAdded.current && fakeStatesCount.current > 0) {
      const totalStatesToGoBack = fakeStatesCount.current + 1;
      
      try {
        window.history.go(-totalStatesToGoBack);
        setTimeout(cleanup, 500);
      } catch {
        cleanup();
        router.back();
      }
    } else {
      cleanup();
      router.back();
    }
  }, [router, enabled]);

  const dismissPopup = useCallback(() => {
    hasShownPopup.current = true;
  }, []);

  return {
    allowNavigation,
    dismissPopup,
  };
}

