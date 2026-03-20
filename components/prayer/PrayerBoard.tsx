"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PrayerCard from "./PrayerCard";
import PrayerComposer from "./PrayerComposer";

export default function PrayerBoard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const supabase = createClient();

  const loadRequests = async () => {
    const { data } = await supabase
      .from("prayer_requests")
      .select("*, users(handle), prayer_responses(id, content, users(handle))")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) {
      setRequests(
        data.map((r: any) => ({
          ...r,
          user_handle: r.users?.handle,
          responses: r.prayer_responses?.map((pr: any) => ({
            ...pr,
            user_handle: pr.users?.handle,
          })),
        }))
      );
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async () => {
    if (!respondingTo || !responseText.trim()) return;
    await fetch("/api/prayer/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: respondingTo, content: responseText.trim() }),
    });
    setRespondingTo(null);
    setResponseText("");
    loadRequests();
  };

  return (
    <div>
      <PrayerComposer onSubmit={loadRequests} />

      {requests.map((req) => (
        <div key={req.id}>
          <PrayerCard
            request={req}
            onRespond={(id) => setRespondingTo(respondingTo === id ? null : id)}
          />
          {respondingTo === req.id && (
            <div className="ml-8 mb-3 flex gap-2">
              <input
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Your prayer or encouragement..."
                className="flex-1 bg-surface-elevated text-xs font-sans text-text-primary rounded-lg px-3 py-2 outline-none placeholder:text-text-muted"
                onKeyDown={(e) => e.key === "Enter" && handleRespond()}
              />
              <button
                onClick={handleRespond}
                className="px-3 py-2 text-xs font-sans bg-text-primary/10 rounded-lg text-text-primary hover:bg-text-primary/20"
              >
                Send
              </button>
            </div>
          )}
        </div>
      ))}

      {requests.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8">
          No prayer requests yet.
        </p>
      )}
    </div>
  );
}
