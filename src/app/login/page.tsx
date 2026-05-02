"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase-browser";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

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
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-medium text-[#3b6e45]">
            Duo Productivity
          </h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-[#5a7a5a]">
            Two people. One task a day. One streak you keep together.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle("signin");
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#7a9e7e]"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-[40px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#7a9e7e]"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="pl-[40px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={pending !== null}
                className="flex-1"
              >
                {pending === "signin" ? "Signing in..." : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handle("signup")}
                disabled={pending !== null}
                className="flex-1"
              >
                {pending === "signup" ? "Creating..." : "Create account"}
              </Button>
            </div>

            {error ? (
              <p className="text-[13px] text-[#993530]">{error}</p>
            ) : null}
          </form>
        </Card>
      </div>
    </main>
  );
}
