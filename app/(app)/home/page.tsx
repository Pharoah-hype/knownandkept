"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function HomePage() {
  const [handle, setHandle] = useState("");
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("handle")
      .eq("id", user.id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("assessment_complete")
      .eq("user_id", user.id)
      .single();

    if (userData) setHandle(userData.handle);
    if (profile) setAssessmentComplete(profile.assessment_complete);
  };

  return (
    <div className="flex-1 px-6 pt-16">
      <p className="text-text-muted text-xs font-sans mb-1 tracking-wider uppercase">
        Welcome back
      </p>
      <h1 className="font-serif text-2xl mb-10">{handle}</h1>

      {!assessmentComplete && (
        <Link
          href="/chat"
          className="block bg-surface rounded-xl p-6 mb-4 hover:bg-surface-elevated transition-colors duration-200"
        >
          <p className="font-serif text-lg mb-1">Continue your conversation</p>
          <p className="text-text-muted text-sm">
            Haven is getting to know you. Pick up where you left off.
          </p>
        </Link>
      )}

      {assessmentComplete && (
        <Link
          href="/chat"
          className="block bg-surface rounded-xl p-6 mb-4 hover:bg-surface-elevated transition-colors duration-200"
        >
          <p className="font-serif text-lg mb-1">Talk to Haven</p>
          <p className="text-text-muted text-sm">
            Your AI companion, shaped by what it knows about you.
          </p>
        </Link>
      )}

      <Link
        href="/community"
        className="block bg-surface rounded-xl p-6 mb-4 hover:bg-surface-elevated transition-colors duration-200"
      >
        <p className="font-serif text-lg mb-1">Community</p>
        <p className="text-text-muted text-sm">
          Anonymous groups of 10 — real people, shared topics.
        </p>
      </Link>

      <Link
        href="/prayer"
        className="block bg-surface rounded-xl p-6 mb-4 hover:bg-surface-elevated transition-colors duration-200"
      >
        <p className="font-serif text-lg mb-1">Prayer Wall</p>
        <p className="text-text-muted text-sm">
          Carry each other. Lift each other up.
        </p>
      </Link>

      <Link
        href="/couple"
        className="block bg-surface rounded-xl p-6 mb-4 hover:bg-surface-elevated transition-colors duration-200"
      >
        <p className="font-serif text-lg mb-1">Couples</p>
        <p className="text-text-muted text-sm">
          A shared space for you and your partner.
        </p>
      </Link>
    </div>
  );
}
