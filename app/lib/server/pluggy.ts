import "server-only";
import { cookies } from "next/headers";
import { PluggyClient } from "pluggy-sdk";

import { BYOK_COOKIE_NAME } from "@/app/lib/local-data";

type PluggyCredentials = {
  clientId: string;
  clientSecret: string;
  itemIds: string[];
};

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

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as {
      clientId?: unknown;
      clientSecret?: unknown;
      itemIds?: unknown;
    };

    const clientId = typeof parsed.clientId === "string" ? parsed.clientId.trim() : "";
    const clientSecret = typeof parsed.clientSecret === "string" ? parsed.clientSecret.trim() : "";
    const itemIdsValue = typeof parsed.itemIds === "string" ? parsed.itemIds : "";
    const itemIds = [...new Set(itemIdsValue.split(/[\n,]/).map((itemId) => itemId.trim()).filter(Boolean))];

    if (!clientId || !clientSecret) {
      return null;
    }

    return {
      clientId,
      clientSecret,
      itemIds,
    };
  } catch {
    return null;
  }
}

async function getCredentials(): Promise<PluggyCredentials> {
  const envClientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID ?? "";
  const envClientSecret = process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET ?? "";
  const cookieCredentials = await readCredentialsFromCookie();

  return {
    clientId: envClientId || cookieCredentials?.clientId || "",
    clientSecret: envClientSecret || cookieCredentials?.clientSecret || "",
    itemIds: cookieCredentials?.itemIds ?? [],
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