"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import ChatInput from "./ChatInput";

declare function obs(event: string, data?: Record<string, unknown>): void;

export default function ChatWindow({
  endpoint,
  extraBody,
}: {
  endpoint: string;
  extraBody?: Record<string, unknown>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [gated, setGated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (content: string) => {
    const userMsg: Message = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: updated, ...extraBody }),
      });

      const data = await res.json();

      if (data.gated) {
        setGated(true);
        if (typeof obs !== "undefined") obs("free_limit_reached");
        return;
      }

      if (data.redirect) {
        window.location.href = "/chat";
        return;
      }

      const assistantMsg: Message = { role: "assistant", content: data.message };
      setMessages([...updated, assistantMsg]);

      if (typeof obs !== "undefined") {
        obs("message_sent");
        obs("session_depth", { count: updated.length + 1 });
      }

      if (data.assessment_complete) {
        if (typeof obs !== "undefined") obs("assessment_complete");
      }
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (gated) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <p className="font-serif text-xl mb-3">You&apos;ve reached your free limit</p>
        <p className="text-text-muted text-sm mb-6 max-w-xs">
          Upgrade to Known for unlimited conversations with your AI companion.
        </p>
        <a
          href="/settings"
          className="px-6 py-3 bg-text-primary/10 rounded-full text-sm font-sans hover:bg-text-primary/20 transition-opacity duration-200"
          onClick={() => {
            if (typeof obs !== "undefined") obs("upgrade_viewed");
          }}
        >
          View Plans
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <p className="font-serif text-lg">Begin when you&apos;re ready.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="mb-6">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
