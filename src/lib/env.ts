import { z } from "zod";

// Validates environment variables at startup and gives a clear error if any
// required one is missing — no more cryptic runtime crashes.
// Set SKIP_ENV_VALIDATION=1 to bypass (e.g. in some CI build steps).

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
});

function loadEnv() {
  if (process.env.SKIP_ENV_VALIDATION) {
    return process.env as unknown as z.infer<typeof schema>;
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "\n❌ Invalid environment variables:\n",
      parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n"),
      "\n\nCheck your .env against .env.example.\n",
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = loadEnv();
