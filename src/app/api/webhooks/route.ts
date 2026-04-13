import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[WEBHOOK] Missing env vars");
    throw new Error("Stripe secret key or webhook secret is not found");
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[WEBHOOK] Missing stripe-signature header");
    return new Response("Missing Stripe signature", { status: 400 });
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  console.log("[WEBHOOK] Event received:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      console.log("[WEBHOOK] checkout.session.completed - userId:", userId);
      console.log("[WEBHOOK] session.metadata:", JSON.stringify(session.metadata));

      if (!userId) {
        console.error("[WEBHOOK] userId not found in metadata - skipping");
        break;
      }

      const stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null);

      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription?.id ?? null);

      console.log("[WEBHOOK] Updating user:", userId, "customer:", stripeCustomerId, "subscription:", stripeSubscriptionId);

      const result = await db
        .update(usersTable)
        .set({ stripeCustomerId, stripeSubscriptionId, plan: "essential" })
        .where(eq(usersTable.id, userId));

      console.log("[WEBHOOK] DB update result:", JSON.stringify(result));
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (
        subscription.status === "canceled" ||
        subscription.cancel_at_period_end
      ) {
        await db
          .update(usersTable)
          .set({ plan: null, stripeSubscriptionId: null })
          .where(eq(usersTable.stripeSubscriptionId, subscription.id));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db
        .update(usersTable)
        .set({ plan: null, stripeSubscriptionId: null })
        .where(eq(usersTable.stripeSubscriptionId, subscription.id));
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
