"use client";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { UIMessage } from "ai";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/markdown";

export function Chat({
  initialMessages,
  pro = true,
  usedToday = 0,
  limit = 0,
}: {
  initialMessages: UIMessage[];
  pro?: boolean;
  usedToday?: number;
  limit?: number;
}) {
  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mx-auto flex w-full min-h-0 max-w-2xl flex-1 flex-col p-4">
      {!pro && (
        <div className="mb-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Free plan · {usedToday}/{limit} messages today ·{" "}
          <Link href="/billing" className="underline">
            Upgrade for unlimited
          </Link>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-muted-foreground">
            Ask me anything to get started.
          </p>
        )}
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          return (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-left ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {m.role === "assistant" ? (
                  <Markdown>{text}</Markdown>
                ) : (
                  <span className="whitespace-pre-wrap">{text}</span>
                )}
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <p className="text-left text-sm text-muted-foreground">Thinking…</p>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="flex gap-2 border-t pt-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
        />
        <Button type="submit" disabled={status !== "ready"}>
          Send
        </Button>
      </form>
    </div>
  );
}
