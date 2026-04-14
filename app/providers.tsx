"use client";

import { SWRConfig } from "swr";
import { PageLoadingProvider } from "@/app/lib/page-loading";

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
  return (
    <SWRConfig value={defaultSWRConfig}>
      <PageLoadingProvider>{children}</PageLoadingProvider>
    </SWRConfig>
  );
}
