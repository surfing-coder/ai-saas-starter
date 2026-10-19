import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { env } from "@/lib/env";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [u] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!u?.stripeCustomerId) {
    return new Response("No Stripe customer on file", { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: u.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL}/billing`,
  });

  return Response.json({ url: portal.url });
}
