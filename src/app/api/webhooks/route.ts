import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe secret key or webhook secret is not found");
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
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
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null);

      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription?.id ?? null);

      await db
        .update(usersTable)
        .set({ stripeCustomerId, stripeSubscriptionId, plan: "essential" })
        .where(eq(usersTable.id, userId));
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
