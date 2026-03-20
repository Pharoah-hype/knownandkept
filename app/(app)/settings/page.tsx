"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

declare function obs(event: string, data?: Record<string, unknown>): void;

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tier: "free",
    features: ["20 AI messages/month", "Prayer wall", "Community (read-only)"],
  },
  {
    name: "Known",
    price: "$9.99/mo",
    tier: "known",
    features: ["Unlimited AI conversation", "Full community access", "Prayer + responses"],
  },
  {
    name: "Known & Kept",
    price: "$19.99/mo",
    tier: "kept",
    features: ["Everything in Known", "Couples mode", "Relationship insights"],
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState("free");
  const [pushEnabled, setPushEnabled] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      setUser(data);
      setTier(data.subscription_tier);
      setPushEnabled(data.push_enabled);
    }
  };

  const handleUpgrade = async (planTier: string) => {
    if (typeof obs !== "undefined") obs("upgrade_viewed");

    const priceMap: Record<string, string> = {
      known: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "known_monthly" : "",
      kept: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "kept_monthly" : "",
    };

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_id: priceMap[planTier] }),
    });

    const data = await res.json();
    if (data.url) {
      if (typeof obs !== "undefined") obs("subscription_started", { tier: planTier });
      window.location.href = data.url;
    }
  };

  const handlePush = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    setPushEnabled(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex-1 px-6 pt-16 pb-8">
      <h1 className="font-serif text-2xl mb-8">Settings</h1>

      {user && (
        <div className="bg-surface rounded-xl p-4 mb-6">
          <p className="font-serif text-base">{user.handle}</p>
          <p className="text-text-muted text-xs mt-1 capitalize">
            {tier} plan{tier !== "free" && ` \u00b7 ${user.subscription_status}`}
          </p>
        </div>
      )}

      <p className="text-text-muted text-xs font-sans tracking-wider uppercase mb-4">
        Plans
      </p>
      <div className="space-y-3 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`bg-surface rounded-xl p-4 ${
              tier === plan.tier ? "ring-1 ring-accent/20" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-serif text-base">{plan.name}</p>
              <p className="text-sm text-text-muted">{plan.price}</p>
            </div>
            <ul className="space-y-1 mb-3">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-text-muted">
                  {f}
                </li>
              ))}
            </ul>
            {tier !== plan.tier && plan.tier !== "free" && (
              <button
                onClick={() => handleUpgrade(plan.tier)}
                className="w-full py-2 text-xs font-sans bg-text-primary/10 rounded-lg text-text-primary hover:bg-text-primary/20 transition-opacity duration-200"
              >
                Upgrade
              </button>
            )}
            {tier === plan.tier && (
              <p className="text-xs text-accent/60 text-center">Current plan</p>
            )}
          </div>
        ))}
      </div>

      <p className="text-text-muted text-xs font-sans tracking-wider uppercase mb-4">
        Notifications
      </p>
      <button
        onClick={handlePush}
        disabled={pushEnabled}
        className="w-full bg-surface rounded-xl p-4 text-left mb-8 hover:bg-surface-elevated transition-colors duration-200"
      >
        <p className="text-sm font-sans">
          {pushEnabled ? "Push notifications enabled" : "Enable push notifications"}
        </p>
      </button>

      <button
        onClick={handleSignOut}
        className="w-full py-3 text-sm font-sans text-text-muted hover:text-text-primary transition-opacity duration-200"
      >
        Sign out
      </button>
    </div>
  );
}
