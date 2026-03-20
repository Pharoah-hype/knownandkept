"use client";

import Avatar from "@/components/ui/Avatar";

interface PrayerRequest {
  id: string;
  content: string;
  created_at: string;
  answered: boolean;
  user_handle?: string;
  responses?: { id: string; content: string; user_handle?: string }[];
}

export default function PrayerCard({
  request,
  onRespond,
}: {
  request: PrayerRequest;
  onRespond?: (requestId: string) => void;
}) {
  const time = new Date(request.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`bg-surface rounded-xl p-4 mb-3 ${request.answered ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar handle={request.user_handle || "A"} size={28} />
        <span className="text-xs text-text-muted font-sans">{request.user_handle || "Anonymous"}</span>
        <span className="text-xs text-text-muted font-sans ml-auto">{time}</span>
        {request.answered && (
          <span className="text-[10px] font-sans text-accent/60 bg-accent/10 px-2 py-0.5 rounded-full">
            Answered
          </span>
        )}
      </div>
      <p className="text-sm font-serif text-text-primary leading-relaxed mb-3">
        {request.content}
      </p>
      {request.responses && request.responses.length > 0 && (
        <div className="border-t border-surface-elevated pt-3 mt-3 space-y-2">
          {request.responses.map((r) => (
            <div key={r.id} className="flex gap-2">
              <Avatar handle={r.user_handle || "A"} size={20} />
              <p className="text-xs text-text-muted leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}
      {onRespond && !request.answered && (
        <button
          onClick={() => onRespond(request.id)}
          className="text-xs text-text-muted hover:text-text-primary mt-2 font-sans transition-opacity duration-200"
        >
          Pray with them
        </button>
      )}
    </div>
  );
}
