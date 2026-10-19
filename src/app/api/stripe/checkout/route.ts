import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: session.user.email,
    metadata: { userId: session.user.id },
  });

  return Response.json({ url: checkout.url });
}
