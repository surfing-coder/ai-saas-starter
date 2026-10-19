import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  // New subscription -> mark user Pro and store their Stripe customer id.
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.metadata?.userId;
    if (userId) {
      await db
        .update(user)
        .set({
          plan: "pro",
          stripeCustomerId:
            typeof s.customer === "string" ? s.customer : null,
        })
        .where(eq(user.id, userId));
    }
  }

  // Subscription cancelled/expired -> downgrade to free.
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    await db
      .update(user)
      .set({ plan: "free" })
      .where(eq(user.stripeCustomerId, customerId));
  }

  return new Response("ok");
}
