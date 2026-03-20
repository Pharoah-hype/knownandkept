"use client";

import { useState } from "react";

export default function PostComposer({
  groupId,
  onPost,
}: {
  groupId: string;
  onPost: () => void;
}) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await fetch("/api/groups/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, content: content.trim() }),
      });
      setContent("");
      onPost();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl p-4 mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share with your group..."
        rows={3}
        className="w-full bg-transparent text-sm font-sans text-text-primary resize-none outline-none placeholder:text-text-muted"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || posting}
          className="px-4 py-2 text-xs font-sans bg-text-primary/10 rounded-full text-text-primary hover:bg-text-primary/20 active:scale-95 transition-opacity duration-200 disabled:opacity-30"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
