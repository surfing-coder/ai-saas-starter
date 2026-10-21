import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { processedStripeEvent } from "@/db/schema";
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

  // Idempotency: record this event id and handle it in one transaction.
  // Stripe retries events and can deliver the same one twice. Inserting the id
  // first means a duplicate hits the primary-key conflict and is skipped. If
  // the handler throws, the whole transaction rolls back (id included), so
  // Stripe's next retry reprocesses cleanly instead of losing the event.
  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(processedStripeEvent)
      .values({ id: event.id })
      .onConflictDoNothing()
      .returning();

    // Already handled a previous delivery of this event -> no-op.
    if (!inserted) return;

    // New subscription -> mark user Pro and store their Stripe customer id.
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId;
      if (userId) {
        await tx
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
      await tx
        .update(user)
        .set({ plan: "free" })
        .where(eq(user.stripeCustomerId, customerId));
    }
  });

  return new Response("ok");
}
