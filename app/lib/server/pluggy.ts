import "server-only";
import { PluggyClient } from "pluggy-sdk";

export function hasPluggyCredentials() {
  const clientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

  return Boolean(clientId && clientSecret);
}

export function getPluggyClient() {
  const clientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Pluggy credentials in environment variables. Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET.",
    );
  }

  return new PluggyClient({ clientId, clientSecret });
}

export function getConfiguredItemIds() {
  const itemIds =
    process.env.PLUGGY_DASHBOARD_ITEM_IDS ?? process.env.PLUGGY_ITEM_IDS ?? process.env.PLUGGY_ITEM_ID ?? "";

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