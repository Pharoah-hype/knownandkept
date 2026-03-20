"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    checkAssessment();
  }, []);

  const checkAssessment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("assessment_complete")
      .eq("user_id", user.id)
      .single();

    setEndpoint(
      data?.assessment_complete ? "/api/chat/message" : "/api/chat/onboarding"
    );
  };

  if (!endpoint) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-text-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted font-sans tracking-wider uppercase">
          {endpoint.includes("onboarding") ? "Getting to know you" : "Haven"}
        </p>
      </div>
      <ChatWindow endpoint={endpoint} />
    </div>
  );
}
