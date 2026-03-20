"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Disclosure {
  wound_shared: boolean;
  fear_shared: boolean;
  desire_shared: boolean;
  value_shared: boolean;
}

export default function DisclosureSettings({ coupleId }: { coupleId: string }) {
  const [disclosure, setDisclosure] = useState<Disclosure>({
    wound_shared: false,
    fear_shared: false,
    desire_shared: false,
    value_shared: false,
  });
  const [disclosureId, setDisclosureId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadDisclosure();
  }, [coupleId]);

  const loadDisclosure = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profile_disclosures")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setDisclosureId(data.id);
      setDisclosure({
        wound_shared: data.wound_shared,
        fear_shared: data.fear_shared,
        desire_shared: data.desire_shared,
        value_shared: data.value_shared,
      });
    }
  };

  const toggle = async (key: keyof Disclosure) => {
    if (!disclosureId) return;
    const updated = { ...disclosure, [key]: !disclosure[key] };
    setDisclosure(updated);
    await supabase
      .from("profile_disclosures")
      .update({ [key]: updated[key] })
      .eq("id", disclosureId);
  };

  const axes = [
    { key: "wound_shared" as const, label: "Wounds", desc: "Deep hurts and experiences" },
    { key: "fear_shared" as const, label: "Fears", desc: "What you're afraid of" },
    { key: "desire_shared" as const, label: "Desires", desc: "What you long for" },
    { key: "value_shared" as const, label: "Values", desc: "What matters most to you" },
  ];

  return (
    <div className="bg-surface rounded-xl p-4">
      <p className="font-serif text-sm mb-4">What you share with your partner</p>
      <div className="space-y-3">
        {axes.map((axis) => (
          <button
            key={axis.key}
            onClick={() => toggle(axis.key)}
            className="w-full flex items-center justify-between p-3 bg-surface-elevated rounded-lg hover:bg-surface-elevated/80 transition-opacity duration-200"
          >
            <div className="text-left">
              <p className="text-sm font-sans text-text-primary">{axis.label}</p>
              <p className="text-xs text-text-muted">{axis.desc}</p>
            </div>
            <div
              className={`w-8 h-5 rounded-full transition-colors duration-200 flex items-center ${
                disclosure[axis.key] ? "bg-accent/40 justify-end" : "bg-surface justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-text-primary mx-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
