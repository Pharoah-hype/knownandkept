"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import GroupFeed from "@/components/community/GroupFeed";

declare function obs(event: string, data?: Record<string, unknown>): void;

const TOPICS = ["anxiety", "marriage", "grief", "identity", "addiction", "parenting"];

export default function CommunityPage() {
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [joining, setJoining] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkMembership();
  }, []);

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("group_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    setHasGroup(data !== null && data.length > 0);
  };

  const joinGroup = async (topic: string) => {
    setJoining(true);
    try {
      await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (typeof obs !== "undefined") obs("group_joined", { topic });
      setHasGroup(true);
    } finally {
      setJoining(false);
    }
  };

  if (hasGroup === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-text-muted/20 animate-pulse" />
      </div>
    );
  }

  if (!hasGroup) {
    return (
      <div className="flex-1 px-6 pt-16">
        <h1 className="font-serif text-2xl mb-2">Community</h1>
        <p className="text-text-muted text-sm mb-8">
          Join an anonymous group of up to 10 people around a shared topic.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => joinGroup(topic)}
              disabled={joining}
              className="bg-surface rounded-xl p-5 text-left hover:bg-surface-elevated active:scale-[0.98] transition-transform duration-200 disabled:opacity-30"
            >
              <p className="font-serif text-base capitalize">{topic}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 pt-16">
      <h1 className="font-serif text-2xl mb-6 px-2">Community</h1>
      <GroupFeed />
    </div>
  );
}
