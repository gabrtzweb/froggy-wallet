import { PluggyClient } from "pluggy-sdk";

function getPluggyClient() {
  const clientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret =
    process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Pluggy credentials in environment variables. Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET.",
    );
  }

  return new PluggyClient({ clientId, clientSecret });
}

function getErrorMessage(error: unknown) {
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

  return "Failed to fetch transactions";
}

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

    const pluggy = getPluggyClient();
    const response = await pluggy.fetchTransactions(accountId);

    return Response.json(response);
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
