"use client";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-surface-elevated rounded-2xl rounded-br-sm px-4 py-3">
          <p className="text-sm font-sans text-text-primary leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 max-w-[90%]">
      <p className="text-[15px] font-serif text-text-primary leading-[1.7] whitespace-pre-wrap">
        {message.content}
      </p>
    </div>
  );
}
