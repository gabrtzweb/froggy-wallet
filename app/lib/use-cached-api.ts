"use client";

import useSWR, { type SWRConfiguration } from "swr";

type UseCachedApiResult<T> = {
  data: T | undefined;
  errorMessage: string | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload;
}

export function useCachedApi<T>(
  key: string | null,
  config?: SWRConfiguration<T, Error>,
): UseCachedApiResult<T> {
  const { data, error, isLoading, isValidating } = useSWR<T, Error>(
    key,
    (url: string) => fetchJson<T>(url),
    config,
  );

  return {
    data,
    errorMessage: error?.message ?? null,
    isInitialLoading: isLoading && !data,
    isRefreshing: isValidating && !!data,
  };
}
