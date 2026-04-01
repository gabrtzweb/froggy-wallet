type PluggyEventName = "item/created" | "item/updated" | "item/error";

type PluggyWebhookEvent = {
  event: PluggyEventName | string;
  eventId?: string;
  itemId?: string;
  error?: unknown;
};

async function handleItemCreated(itemId?: string) {
  if (!itemId) return;
  console.log("[pluggy-webhook] item created", { itemId });
}

async function handleItemUpdated(itemId?: string) {
  if (!itemId) return;
  console.log("[pluggy-webhook] item updated", { itemId });
}

async function handleItemError(itemId?: string, error?: unknown) {
  console.error("[pluggy-webhook] item error", { itemId, error });
}

async function processPluggyEvent(event: PluggyWebhookEvent) {
  switch (event.event) {
    case "item/created":
      await handleItemCreated(event.itemId);
      break;
    case "item/updated":
      await handleItemUpdated(event.itemId);
      break;
    case "item/error":
      await handleItemError(event.itemId, event.error);
      break;
    default:
      console.log("[pluggy-webhook] unsupported event", { event: event.event });
      break;
  }
}

export async function POST(req: Request) {
  const event = (await req.json()) as PluggyWebhookEvent;

  console.log("[pluggy-webhook] received", {
    event: event.event,
    eventId: event.eventId,
  });

  void processPluggyEvent(event).catch((error: unknown) => {
    console.error("[pluggy-webhook] async processing failed", { error });
  });

  return Response.json({ received: true });
}
