"use client";

import ChatWindow from "@/components/chat/ChatWindow";

export default function CoupleChat({ coupleId }: { coupleId: string }) {
  return (
    <ChatWindow
      endpoint="/api/couples/message"
      extraBody={{ couple_id: coupleId }}
    />
  );
}
