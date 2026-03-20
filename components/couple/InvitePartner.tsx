"use client";

import { useState } from "react";

declare function obs(event: string, data?: Record<string, unknown>): void;

export default function InvitePartner() {
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/couples/invite", { method: "POST" });
      const data = await res.json();
      if (data.link) {
        setInviteLink(data.link);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteLink) {
    return (
      <div className="bg-surface rounded-xl p-6 text-center">
        <p className="font-serif text-lg mb-2">Invite sent</p>
        <p className="text-text-muted text-xs mb-4">Share this link with your partner</p>
        <div className="bg-surface-elevated rounded-lg p-3 mb-4 break-all text-xs text-text-muted font-mono">
          {inviteLink}
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-xs font-sans bg-text-primary/10 rounded-full text-text-primary hover:bg-text-primary/20 transition-opacity duration-200"
        >
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 text-center">
      <p className="font-serif text-lg mb-2">Couples Mode</p>
      <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">
        Invite your partner to share an AI-guided space together.
        Both of you need to complete your individual assessment first.
      </p>
      <button
        onClick={handleInvite}
        disabled={loading}
        className="px-6 py-3 text-sm font-sans bg-text-primary/10 rounded-full text-text-primary hover:bg-text-primary/20 active:scale-95 transition-opacity duration-200 disabled:opacity-30"
      >
        {loading ? "Creating..." : "Invite Partner"}
      </button>
    </div>
  );
}
