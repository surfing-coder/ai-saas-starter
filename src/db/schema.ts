import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Re-export Better Auth tables so drizzle-kit sees them in one schema.
export * from "./auth-schema";

// --- App tables: AI chat history ---
export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const message = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Idempotency ledger for Stripe webhooks. Stripe retries events (and can deliver
// the same one more than once), so we record every event id we've handled and
// skip any we've already seen. id is Stripe's event id, e.g. "evt_...".
// TODO: this table grows one row per event; prune rows older than ~30 days
// later (Stripe stops retrying after ~3 days). Fine to ignore at low volume.
export const processedStripeEvent = pgTable("processed_stripe_event", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
