"use client";

import Avatar from "@/components/ui/Avatar";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_handle?: string;
  distress_flagged?: boolean;
  responses?: { id: string; content: string; user_handle?: string; created_at: string }[];
}

export default function PostCard({
  post,
  onReply,
}: {
  post: Post;
  onReply?: (postId: string) => void;
}) {
  const time = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-surface rounded-xl p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <Avatar handle={post.user_handle || "A"} size={28} />
        <span className="text-xs text-text-muted font-sans">{post.user_handle || "Anonymous"}</span>
        <span className="text-xs text-text-muted font-sans ml-auto">{time}</span>
      </div>
      <p className="text-sm font-sans text-text-primary leading-relaxed mb-3">
        {post.content}
      </p>
      {post.responses && post.responses.length > 0 && (
        <div className="border-t border-surface-elevated pt-3 mt-3 space-y-2">
          {post.responses.map((r) => (
            <div key={r.id} className="flex gap-2">
              <Avatar handle={r.user_handle || "A"} size={20} />
              <p className="text-xs text-text-muted leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}
      {onReply && (
        <button
          onClick={() => onReply(post.id)}
          className="text-xs text-text-muted hover:text-text-primary mt-2 font-sans transition-opacity duration-200"
        >
          Reply
        </button>
      )}
    </div>
  );
}
