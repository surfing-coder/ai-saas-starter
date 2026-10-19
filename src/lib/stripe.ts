import Stripe from "stripe";

// Fallback keeps `next build` from throwing before env is configured.
// Real API calls will fail clearly if STRIPE_SECRET_KEY is unset.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);
