"use client";

import { useEffect } from "react";
import { SWRConfig } from "swr";
import { PageLoadingProvider } from "@/app/components/page-loading";
import { syncByokCookieFromStorage } from "@/app/lib/local-data";

const defaultSWRConfig = {
  revalidateOnFocus: true,
  revalidateIfStale: true,
  keepPreviousData: true,
  dedupingInterval: 10_000,
  focusThrottleInterval: 15_000,
  errorRetryCount: 0,
  shouldRetryOnError: false,
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    syncByokCookieFromStorage();
  }, []);

  return (
    <SWRConfig value={defaultSWRConfig}>
      <PageLoadingProvider>{children}</PageLoadingProvider>
    </SWRConfig>
  );
}
