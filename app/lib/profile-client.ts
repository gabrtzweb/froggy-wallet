import { useSyncExternalStore } from "react";

export const PROFILE_NAME_STORAGE_KEY = "froggy-profile-name";
export const PROFILE_UPDATED_EVENT = "froggy-profile-updated";

export function createProfileInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

export function getProfileFirstName(name: string) {
  const firstName = name.trim().split(/\s+/).filter(Boolean)[0] ?? "";
  return firstName || name.trim();
}

function getStoredProfileName(fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(PROFILE_NAME_STORAGE_KEY)?.trim();
  return storedValue || fallback;
}

function subscribeToProfileUpdates(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleUpdate() {
    onStoreChange();
  }

  window.addEventListener(PROFILE_UPDATED_EVENT, handleUpdate as EventListener);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(PROFILE_UPDATED_EVENT, handleUpdate as EventListener);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function useProfileName(fallback: string) {
  return useSyncExternalStore(
    subscribeToProfileUpdates,
    () => getStoredProfileName(fallback),
    () => fallback,
  );
}

export function readProfileName(fallback: string) {
  return getStoredProfileName(fallback);
}

export function persistProfileName(name: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedName = name.trim();
  window.localStorage.setItem(PROFILE_NAME_STORAGE_KEY, normalizedName);
  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: { name: normalizedName },
    }),
  );
}