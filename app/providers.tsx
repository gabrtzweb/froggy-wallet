"use client";

import { SWRConfig } from "swr";

const defaultSWRConfig = {
  revalidateOnFocus: true,
  revalidateIfStale: true,
  keepPreviousData: true,
  dedupingInterval: 10_000,
  focusThrottleInterval: 15_000,
  errorRetryCount: 2,
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={defaultSWRConfig}>{children}</SWRConfig>;
}
