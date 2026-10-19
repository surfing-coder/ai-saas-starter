import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { headers } from "next/headers";
import { and, count, eq, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chat, message } from "@/db/schema";
import { FREE_DAILY_MESSAGE_LIMIT, isPro } from "@/lib/plans";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get or create this user's chat.
  let [row] = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .limit(1);
  if (!row) {
    [row] = await db
      .insert(chat)
      .values({ userId: session.user.id })
      .returning();
  }
  const chatId = row.id;

  // Enforce the free-plan daily cap (keeps your AI bill sane).
  if (!isPro(plan)) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [c] = await db
      .select({ value: count() })
      .from(message)
      .where(
        and(
          eq(message.chatId, chatId),
          eq(message.role, "user"),
          gte(message.createdAt, since),
        ),
      );
    if (Number(c?.value ?? 0) >= FREE_DAILY_MESSAGE_LIMIT) {
      return new Response(
        `Daily free limit of ${FREE_DAILY_MESSAGE_LIMIT} messages reached. Upgrade to Pro for unlimited.`,
        { status: 429 },
      );
    }
  }

  // Persist the latest user message.
  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    const text = last.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");
    await db.insert(message).values({ chatId, role: "user", content: text });
  }

  const result = streamText({
    model: anthropic("claude-haiku-4-5"), // swap to claude-sonnet-4-6 for higher quality
    system:
      "You are a helpful AI assistant. Always format your responses in clean Markdown: " +
      "use '## ' headings on their own line, proper bullet lists with each item on its own line " +
      "starting with '- ', numbered lists with '1. ', **bold** for emphasis, and fenced ``` code blocks " +
      "for any code. Leave a blank line before lists and headings.",
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      await db.insert(message).values({ chatId, role: "assistant", content: text });
    },
  });

  return result.toUIMessageStreamResponse();
}
