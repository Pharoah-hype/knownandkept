"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, handle }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/home");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-center mb-2">Known & Kept</h1>
        <p className="text-text-muted text-sm text-center mb-10">
          A private space to be fully known.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Choose a handle"
            required
            minLength={3}
            maxLength={20}
            className="w-full bg-surface text-sm font-sans text-text-primary rounded-xl px-4 py-3 outline-none placeholder:text-text-muted focus:ring-1 focus:ring-accent/20"
          />
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
            minLength={8}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-text-muted text-xs text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
