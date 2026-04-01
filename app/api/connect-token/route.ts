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

async function createToken(clientUserId?: string) {
  const pluggy = getPluggyClient();
  const connectToken = await pluggy.createConnectToken(clientUserId);
  return connectToken.accessToken;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientUserId = searchParams.get("clientUserId") ?? undefined;
    const accessToken = await createToken(clientUserId);

    return Response.json({ accessToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create connect token";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { clientUserId?: string };
    const clientUserId =
      typeof body.clientUserId === "string" ? body.clientUserId : undefined;
    const accessToken = await createToken(clientUserId);

    return Response.json({ accessToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create connect token";
    return Response.json({ error: message }, { status: 500 });
  }
}
