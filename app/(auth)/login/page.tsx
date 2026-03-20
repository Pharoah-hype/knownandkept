"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-center mb-2">Known & Kept</h1>
        <p className="text-text-muted text-sm text-center mb-10">
          Welcome back.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-surface text-sm font-sans text-text-primary rounded-xl px-4 py-3 outline-none placeholder:text-text-muted focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-surface text-sm font-sans text-text-primary rounded-xl px-4 py-3 outline-none placeholder:text-text-muted focus:ring-1 focus:ring-accent/20"
          />

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-sans bg-text-primary/10 rounded-xl text-text-primary hover:bg-text-primary/20 active:scale-[0.98] transition-transform duration-200 disabled:opacity-30"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-text-muted text-xs text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
