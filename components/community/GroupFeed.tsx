"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";

interface GroupData {
  id: string;
  topic: string;
}

export default function GroupFeed() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(id, topic)")
      .order("joined_at", { ascending: false });

    if (data) {
      const g = data.map((d: any) => d.groups).filter(Boolean);
      setGroups(g);
      if (g.length > 0) {
        setActiveGroup(g[0]);
        loadPosts(g[0].id);
      }
    }
    setLoading(false);
  };

  const loadPosts = useCallback(async (groupId: string) => {
    const { data } = await supabase
      .from("group_posts")
      .select("*, users(handle)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) {
      setPosts(
        data.map((p: any) => ({
          ...p,
          user_handle: p.users?.handle,
        }))
      );
    }
  }, [supabase]);

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-text-muted text-sm">Loading...</div>;
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setActiveGroup(g);
              loadPosts(g.id);
            }}
            className={`px-3 py-1.5 text-xs font-sans rounded-full whitespace-nowrap transition-opacity duration-200 ${
              activeGroup?.id === g.id
                ? "bg-text-primary/15 text-text-primary"
                : "bg-surface text-text-muted hover:text-text-primary"
            }`}
          >
            {g.topic}
          </button>
        ))}
      </div>

      {activeGroup && (
        <>
          <PostComposer groupId={activeGroup.id} onPost={() => loadPosts(activeGroup.id)} />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <p className="text-center text-text-muted text-sm py-8">
              No posts yet. Be the first to share.
            </p>
          )}
        </>
      )}
    </div>
  );
}
