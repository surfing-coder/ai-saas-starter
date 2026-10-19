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
