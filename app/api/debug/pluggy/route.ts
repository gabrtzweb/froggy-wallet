import { PluggyClient } from "pluggy-sdk";

function getPluggyClient() {
  const clientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Pluggy credentials in environment variables. Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET.",
    );
  }

  return new PluggyClient({ clientId, clientSecret });
}

function getItemIds() {
  const itemIds =
    process.env.PLUGGY_DASHBOARD_ITEM_IDS ?? process.env.PLUGGY_ITEM_IDS ?? process.env.PLUGGY_ITEM_ID ?? "";

  return [...new Set(itemIds.split(",").map((itemId) => itemId.trim()).filter(Boolean))];
}

function normalizeError(error: unknown) {
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

  return "Failed to load Pluggy debug data";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedItemId = searchParams.get("itemId")?.trim();
    const configuredItemIds = getItemIds();
    const itemIds = requestedItemId ? [requestedItemId] : configuredItemIds;

    if (!itemIds.length) {
      return Response.json(
        {
          error:
            "No Pluggy dashboard item IDs were configured. Add PLUGGY_DASHBOARD_ITEM_IDS to .env.local.",
        },
        { status: 400 },
      );
    }

    const pluggy = getPluggyClient();

    const items = await Promise.all(
      itemIds.map(async (itemId) => {
        const [item, accountsResponse, investmentsResponse] = await Promise.all([
          pluggy.fetchItem(itemId),
          pluggy.fetchAccounts(itemId),
          pluggy.fetchInvestments(itemId, undefined, { pageSize: 500 }),
        ]);

        return {
          itemId,
          item,
          accounts: accountsResponse.results,
          investments: investmentsResponse.results,
        };
      }),
    );

    return Response.json({
      itemIds,
      items,
    });
  } catch (error) {
    return Response.json({ error: normalizeError(error) }, { status: 500 });
  }
}
