import "server-only";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { PluggyClient } from "pluggy-sdk";

import { BYOK_COOKIE_NAME } from "@/app/lib/local-data";

type PluggyCredentials = {
  clientId: string;
  clientSecret: string;
  itemIds: string[];
};

type RawByokPayload = {
  clientId?: unknown;
  clientSecret?: unknown;
  itemIds?: unknown;
};

function parseItemIds(itemIds: unknown) {
  if (typeof itemIds === "string") {
    return [...new Set(itemIds.split(/[\n,]/).map((itemId) => itemId.trim()).filter(Boolean))];
  }

  if (Array.isArray(itemIds)) {
    return [...new Set(itemIds.map((itemId) => (typeof itemId === "string" ? itemId.trim() : "")).filter(Boolean))];
  }

  return [];
}

function parseByokPayload(rawValue: string): PluggyCredentials | null {
  try {
    const directParsed = JSON.parse(rawValue) as RawByokPayload;
    const clientId = typeof directParsed.clientId === "string" ? directParsed.clientId.trim() : "";
    const clientSecret = typeof directParsed.clientSecret === "string" ? directParsed.clientSecret.trim() : "";
    const itemIds = parseItemIds(directParsed.itemIds);

    if (!clientId || !clientSecret) {
      return null;
    }

    return { clientId, clientSecret, itemIds };
  } catch {
    try {
      const decodedParsed = JSON.parse(decodeURIComponent(rawValue)) as RawByokPayload;
      const clientId = typeof decodedParsed.clientId === "string" ? decodedParsed.clientId.trim() : "";
      const clientSecret = typeof decodedParsed.clientSecret === "string" ? decodedParsed.clientSecret.trim() : "";
      const itemIds = parseItemIds(decodedParsed.itemIds);

      if (!clientId || !clientSecret) {
        return null;
      }

      return { clientId, clientSecret, itemIds };
    } catch {
      return null;
    }
  }
}

async function readCookieValue(name: string) {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value ?? null;
  } catch {
    return null;
  }
}

async function readCredentialsFromCookie(): Promise<PluggyCredentials | null> {
  const rawValue = await readCookieValue(BYOK_COOKIE_NAME);
  if (!rawValue) {
    return null;
  }

  return parseByokPayload(rawValue);
}

async function readCredentialsFromHeader(): Promise<PluggyCredentials | null> {
  try {
    const headerStore = await headers();
    const rawValue = headerStore.get("x-froggy-byok");
    if (!rawValue) {
      return null;
    }

    return parseByokPayload(rawValue);
  } catch {
    return null;
  }
}

async function getCredentials(): Promise<PluggyCredentials> {
  const envClientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID ?? "";
  const envClientSecret = process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET ?? "";
  const headerCredentials = await readCredentialsFromHeader();
  const cookieCredentials = await readCredentialsFromCookie();
  const runtimeCredentials = headerCredentials ?? cookieCredentials;

  return {
    clientId: runtimeCredentials?.clientId || envClientId,
    clientSecret: runtimeCredentials?.clientSecret || envClientSecret,
    itemIds: runtimeCredentials?.itemIds ?? [],
  };
}

export async function hasPluggyCredentials() {
  const { clientId, clientSecret } = await getCredentials();

  return Boolean(clientId && clientSecret);
}

export async function getPluggyClient() {
  const { clientId, clientSecret } = await getCredentials();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Pluggy credentials. Save BYOK credentials in Settings.",
    );
  }

  return new PluggyClient({ clientId, clientSecret });
}

export async function getConfiguredItemIds() {
  const { itemIds: cookieItemIds } = await getCredentials();
  const envItemIds =
    process.env.PLUGGY_DASHBOARD_ITEM_IDS ??
    process.env.PLUGGY_ITEM_IDS ??
    process.env.PLUGGY_ITEM_ID ??
    "";

  const itemIds = cookieItemIds.join(",") || envItemIds;

  return [...new Set(itemIds.split(",").map((itemId) => itemId.trim()).filter(Boolean))];
}

export function normalizeErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallbackMessage;
}