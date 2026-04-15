import { getPluggyClient, normalizeErrorMessage } from "@/app/lib/server/pluggy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return Response.json(
        { error: "itemId query parameter is required" },
        { status: 400 },
      );
    }

    const pluggy = await getPluggyClient();
    const response = await pluggy.fetchAccounts(itemId);

    return Response.json(response);
  } catch (error) {
    const message = normalizeErrorMessage(error, "Failed to fetch accounts");
    return Response.json({ error: message }, { status: 500 });
  }
}
