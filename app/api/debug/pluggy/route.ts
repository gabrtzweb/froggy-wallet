import {
  getConfiguredItemIds,
  getPluggyClient,
  normalizeErrorMessage,
} from "@/app/lib/server/pluggy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedItemId = searchParams.get("itemId")?.trim();
    const configuredItemIds = getConfiguredItemIds();
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
        const [item, accountsResponse, investmentsResponse, identity] = await Promise.all([
          pluggy.fetchItem(itemId),
          pluggy.fetchAccounts(itemId),
          pluggy.fetchInvestments(itemId, undefined, { pageSize: 500 }),
          pluggy.fetchIdentityByItemId(itemId).catch(() => null),
        ]);

        return {
          itemId,
          item,
          accounts: accountsResponse.results,
          investments: investmentsResponse.results,
          identity,
        };
      }),
    );

    return Response.json({
      itemIds,
      items,
    });
  } catch (error) {
    const message = normalizeErrorMessage(error, "Failed to load Pluggy debug data");
    return Response.json({ error: message }, { status: 500 });
  }
}
