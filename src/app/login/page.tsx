"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase-browser";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(mode: Mode) {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setPending(mode);
    try {
      const sb = supabaseBrowser();
      const { error } =
        mode === "signin"
          ? await sb.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            })
          : await sb.auth.signUp({
              email: trimmedEmail,
              password,
            });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">Duo Productivity</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Sign in or create an account to start a streak.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handle("signin");
          }}
          className="flex flex-col gap-3"
        >
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

          <label htmlFor="password" className="text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          />

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={pending !== null}
              className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 disabled:opacity-50"
            >
              {pending === "signin" ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => handle("signup")}
              disabled={pending !== null}
              className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 disabled:opacity-50"
            >
              {pending === "signup" ? "Creating..." : "Create account"}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
