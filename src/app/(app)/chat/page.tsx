import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, count, eq, gte } from "drizzle-orm";
import type { UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chat, message } from "@/db/schema";
import { Chat } from "@/components/chat";
import { FREE_DAILY_MESSAGE_LIMIT, isPro } from "@/lib/plans";

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const plan = (session.user as { plan?: string }).plan ?? "free";

  const [existing] = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .limit(1);

  let initialMessages: UIMessage[] = [];
  let usedToday = 0;

  if (existing) {
    const rows = await db
      .select()
      .from(message)
      .where(eq(message.chatId, existing.id))
      .orderBy(asc(message.createdAt));
    initialMessages = rows.map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      parts: [{ type: "text", text: r.content }],
    }));

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [c] = await db
      .select({ value: count() })
      .from(message)
      .where(
        and(
          eq(message.chatId, existing.id),
          eq(message.role, "user"),
          gte(message.createdAt, since),
        ),
      );
    usedToday = Number(c?.value ?? 0);
  }

  return (
    <Chat
      initialMessages={initialMessages}
      pro={isPro(plan)}
      usedToday={usedToday}
      limit={FREE_DAILY_MESSAGE_LIMIT}
    />
  );
}
