import { PluggyClient } from "pluggy-sdk";

export async function POST(req: Request) {
  const clientId = process.env.PLUGGY_CLIENT_ID ?? process.env.CLIENT_ID;
  const clientSecret =
    process.env.PLUGGY_CLIENT_SECRET ?? process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json(
      {
        error:
          "Missing Pluggy credentials in environment variables. Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET.",
      },
      { status: 500 },
    );
  }

  const pluggy = new PluggyClient({
    clientId,
    clientSecret,
  });

  const body = (await req.json()) as { clientUserId?: string };
  const clientUserId =
    typeof body.clientUserId === "string" ? body.clientUserId : undefined;

  const connectToken = await pluggy.createConnectToken(clientUserId);

  return Response.json({ accessToken: connectToken.accessToken });
}
