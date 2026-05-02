"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">Duo Productivity</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Sign in with your email — we&apos;ll send you a magic link.
        </p>

        {sent ? (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4">
            <p className="font-medium">Check your inbox</p>
            <p className="text-sm text-zinc-500 mt-1">
              Sent a sign-in link to <span className="font-mono">{email}</span>.
              Click the link there to finish signing in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
            />
            <button
              type="submit"
              disabled={pending}
              className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 disabled:opacity-50"
            >
              {pending ? "Sending..." : "Send magic link"}
            </button>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </form>
        )}
      </div>
    </main>
  );
}
