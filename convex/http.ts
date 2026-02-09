import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          event.data;
        if (!id) break;

        const email = email_addresses?.[0]?.email_address ?? "";
        const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: id,
          email,
          name,
          avatar: image_url,
        });
        break;
      }

      case "user.deleted": {
        const { id } = event.data;
        if (id) {
          await ctx.runMutation(internal.users.deleteFromClerk, { clerkId: id });
        }
        break;
      }

      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

type WebhookEvent = {
  type: string;
  data: {
    id?: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
};

async function validateRequest(
  req: Request
): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
