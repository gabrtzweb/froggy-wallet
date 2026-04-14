"use client";

import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";

type PageLoadingContextValue = {
  setSourceLoading: (sourceId: symbol, loading: boolean) => void;
  isLoading: boolean;
};

const PageLoadingContext = createContext<PageLoadingContextValue | null>(null);

function GlobalLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  const t = useTranslations("globalStates");
  const loadingLabel = t("loadingDashboard");

  if (!isLoading) {
    return null;
  }

  return (
    <div className="globalLoadingOverlay" role="status" aria-live="polite" aria-label={loadingLabel}>
      <div className="globalLoadingCard">
        <strong>{loadingLabel}</strong>
        <span className="globalLoadingSpinner" aria-hidden="true" />
      </div>
    </div>
  );
}

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeSources, setActiveSources] = useState<Set<symbol>>(() => new Set());

  const setSourceLoading = useCallback((sourceId: symbol, loading: boolean) => {
    setActiveSources((previousSources) => {
      const hasSource = previousSources.has(sourceId);

      if (loading && hasSource) {
        return previousSources;
      }

      if (!loading && !hasSource) {
        return previousSources;
      }

      const nextSources = new Set(previousSources);

      if (loading) {
        nextSources.add(sourceId);
      } else {
        nextSources.delete(sourceId);
      }

      return nextSources;
    });
  }, []);

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isLoading = !isHydrated || activeSources.size > 0;

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        document.body.classList.add("app-ready");
        document.body.classList.remove("app-is-loading");
      }, 400);
      return () => clearTimeout(timer);
    }

    document.body.classList.add("app-is-loading");
    document.body.classList.remove("app-ready");
    return () => {
      document.body.classList.remove("app-is-loading");
    };
  }, [isLoading]);

  const contextValue = useMemo(
    () => ({
      setSourceLoading,
      isLoading,
    }),
    [setSourceLoading, isLoading],
  );

  return (
    <PageLoadingContext.Provider value={contextValue}>
      {children}
      <GlobalLoadingOverlay isLoading={isLoading} />
    </PageLoadingContext.Provider>
  );
}

export function useGlobalPageLoading(isLoading: boolean) {
  const context = useContext(PageLoadingContext);
  const sourceIdRef = useRef(Symbol("global-loading-source"));

  useEffect(() => {
    if (!context) {
      return;
    }

    const sourceId = sourceIdRef.current;

    context.setSourceLoading(sourceId, isLoading);

    return () => {
      context.setSourceLoading(sourceId, false);
    };
  }, [context, isLoading]);
}
