// Plan limits — the AI-specific guardrail. Free users are capped so your
// API bill stays sane; Pro is unlimited. Tune these to your economics.

export const FREE_DAILY_MESSAGE_LIMIT = 10;

export function isPro(plan?: string | null) {
  return plan === "pro";
}
