"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useGlobalPageLoading } from "@/app/lib/page-loading";

type UseCachedApiResult<T> = {
  data: T | undefined;
  errorMessage: string | null;
  isInitialLoading: boolean;
  isRefreshing: boolean;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const rawBody = await response.text();
  let payload: (T & { error?: string }) | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as T & { error?: string };
    } catch {
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      throw new Error("The API returned an unexpected response format");
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }

  return payload as T;
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
  const isInitialLoading = isLoading && !data;

  useGlobalPageLoading(isInitialLoading);

  return {
    data,
    errorMessage: error?.message ?? null,
    isInitialLoading,
    isRefreshing: isValidating && !!data,
  };
}
