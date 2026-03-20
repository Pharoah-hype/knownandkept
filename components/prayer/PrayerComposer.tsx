"use client";

import { useState } from "react";

declare function obs(event: string, data?: Record<string, unknown>): void;

export default function PrayerComposer({ onSubmit }: { onSubmit: () => void }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/prayer/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent("");
      onSubmit();
      if (typeof obs !== "undefined") obs("prayer_submitted");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl p-4 mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your heart?"
        rows={3}
        className="w-full bg-transparent text-sm font-serif text-text-primary resize-none outline-none placeholder:text-text-muted"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="px-4 py-2 text-xs font-sans bg-text-primary/10 rounded-full text-text-primary hover:bg-text-primary/20 active:scale-95 transition-opacity duration-200 disabled:opacity-30"
        >
          {submitting ? "Submitting..." : "Submit Prayer"}
        </button>
      </div>
    </div>
  );
}
