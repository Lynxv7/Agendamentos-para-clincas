"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const createStripeCheckout = actionClient.action(async () => {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });
  if (!authSession?.user) {
    throw new Error("Unauthorized");
  }
  if (!("clinic" in authSession.user) || !authSession.user.clinic) {
    throw new Error("User does not have a clinic");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured");
  }
  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  const checkoutSession = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    customer_email: authSession.user.email,
    // metadata no nível da sessão — acessível no evento checkout.session.completed
    metadata: {
      userId: authSession.user.id,
      clinicId: String(authSession.user.clinic.id),
    },
    subscription_data: {
      metadata: {
        userId: authSession.user.id,
        clinicId: String(authSession.user.clinic.id),
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_ESSETIAL_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  });
  return {
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
  };
});
