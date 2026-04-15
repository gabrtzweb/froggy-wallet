import { getPluggyClient, normalizeErrorMessage } from "@/app/lib/server/pluggy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return Response.json(
        { error: "accountId query parameter is required" },
        { status: 400 },
      );
    }

    const pluggy = await getPluggyClient();
    const response = await pluggy.fetchTransactions(accountId);

    return Response.json(response);
  } catch (error) {
    const message = normalizeErrorMessage(error, "Failed to fetch transactions");
    return Response.json({ error: message }, { status: 500 });
  }
}
