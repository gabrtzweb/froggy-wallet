import {
  PROFILE_IMAGE_STORAGE_KEY,
  PROFILE_NAME_STORAGE_KEY,
  PROFILE_UPDATED_EVENT,
} from "@/app/lib/profile-storage";

export const BYOK_STORAGE_KEY = "froggy-byok-config";
export const LOCAL_DATA_UPDATED_EVENT = "froggy-local-data-updated";
export const BYOK_COOKIE_NAME = "froggy-byok-config";

export type ByokConfig = {
  clientId: string;
  clientSecret: string;
  itemIds: string;
};

export type AppLocalData = {
  profileName: string | null;
  profileImageDataUrl: string | null;
  byok: ByokConfig | null;
};

function normalizeByokConfig(input: Partial<ByokConfig> | null | undefined): ByokConfig | null {
  if (!input) {
    return null;
  }

  const clientId = typeof input.clientId === "string" ? input.clientId.trim() : "";
  const clientSecret = typeof input.clientSecret === "string" ? input.clientSecret.trim() : "";
  const itemIds = typeof input.itemIds === "string" ? input.itemIds.trim() : "";

  if (!clientId && !clientSecret && !itemIds) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    itemIds,
  };
}

function writeByokCookie(value: ByokConfig | null) {
  if (typeof document === "undefined") {
    return;
  }

  if (!value) {
    document.cookie = `${BYOK_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${BYOK_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Path=/; SameSite=Lax`;
}

export function dispatchLocalDataUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(LOCAL_DATA_UPDATED_EVENT));
}

export function readByokConfig(): ByokConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(BYOK_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ByokConfig>;
    return normalizeByokConfig(parsed);
  } catch {
    return null;
  }
}

export function syncByokCookieFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  const storedValue = readByokConfig();
  if (storedValue) {
    writeByokCookie(storedValue);
  }
}

export function persistByokConfig(value: Partial<ByokConfig>) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeByokConfig(value);

  if (!normalized) {
    window.localStorage.removeItem(BYOK_STORAGE_KEY);
    writeByokCookie(null);
  } else {
    window.localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(normalized));
    writeByokCookie(normalized);
  }

  dispatchLocalDataUpdated();
}

export function readAppLocalDataFromStorage(): AppLocalData {
  if (typeof window === "undefined") {
    return {
      profileName: null,
      profileImageDataUrl: null,
      byok: null,
    };
  }

  const profileName = window.localStorage.getItem(PROFILE_NAME_STORAGE_KEY)?.trim() || null;
  const profileImageDataUrl = window.localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY)?.trim() || null;

  return {
    profileName,
    profileImageDataUrl,
    byok: readByokConfig(),
  };
}

export function clearAppLocalData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFILE_NAME_STORAGE_KEY);
  window.localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
  window.localStorage.removeItem(BYOK_STORAGE_KEY);
  writeByokCookie(null);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  dispatchLocalDataUpdated();
}

export function readProfileImageDataUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY)?.trim();
  return value || null;
}

export function persistProfileImageDataUrl(dataUrl: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = typeof dataUrl === "string" ? dataUrl.trim() : "";
  if (normalized) {
    window.localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, normalized);
  } else {
    window.localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  dispatchLocalDataUpdated();
}

export function applyImportedAppLocalData(value: unknown): AppLocalData {
  if (typeof window === "undefined") {
    return {
      profileName: null,
      profileImageDataUrl: null,
      byok: null,
    };
  }

  if (!value || typeof value !== "object") {
    throw new Error("Invalid import format.");
  }

  const candidate = value as Partial<AppLocalData>;
  const profileName = typeof candidate.profileName === "string" ? candidate.profileName.trim() : "";
  const profileImageDataUrl = typeof candidate.profileImageDataUrl === "string"
    ? candidate.profileImageDataUrl.trim()
    : "";
  const byok = normalizeByokConfig(candidate.byok as Partial<ByokConfig> | null | undefined);

  if (profileName) {
    window.localStorage.setItem(PROFILE_NAME_STORAGE_KEY, profileName);
  } else {
    window.localStorage.removeItem(PROFILE_NAME_STORAGE_KEY);
  }

  if (profileImageDataUrl) {
    window.localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, profileImageDataUrl);
  } else {
    window.localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY);
  }

  if (byok) {
    window.localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(byok));
    writeByokCookie(byok);
  } else {
    window.localStorage.removeItem(BYOK_STORAGE_KEY);
    writeByokCookie(null);
  }

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  dispatchLocalDataUpdated();

  return {
    profileName: profileName || null,
    profileImageDataUrl: profileImageDataUrl || null,
    byok,
  };
}
