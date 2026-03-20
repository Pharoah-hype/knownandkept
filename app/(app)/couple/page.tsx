"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import InvitePartner from "@/components/couple/InvitePartner";
import CoupleChat from "@/components/couple/CoupleChat";
import DisclosureSettings from "@/components/couple/DisclosureSettings";

declare function obs(event: string, data?: Record<string, unknown>): void;

export default function CouplePage() {
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDisclosures, setShowDisclosures] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadCouple();
  }, []);

  const loadCouple = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("couples")
      .select("*")
      .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
      .eq("invite_accepted", true)
      .single();

    if (data) {
      setCouple(data);
      if (typeof obs !== "undefined") obs("couple_linked");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-text-muted/20 animate-pulse" />
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="flex-1 px-6 pt-16">
        <h1 className="font-serif text-2xl mb-6">Couples</h1>
        <InvitePartner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-xs text-text-muted font-sans tracking-wider uppercase">
          Couples Session
        </p>
        <button
          onClick={() => setShowDisclosures(!showDisclosures)}
          className="text-xs text-text-muted hover:text-text-primary transition-opacity duration-200"
        >
          {showDisclosures ? "Chat" : "Sharing"}
        </button>
      </div>

      {showDisclosures ? (
        <div className="flex-1 px-4 overflow-y-auto">
          <DisclosureSettings coupleId={couple.id} />
        </div>
      ) : (
        <CoupleChat coupleId={couple.id} />
      )}
    </div>
  );
}
