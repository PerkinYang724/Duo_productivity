import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";
import { getOrCreateUser } from "./db";
import type { AppUser } from "./types";

export async function requireAppUser(): Promise<AppUser> {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const email = user.email ?? "";
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    email.split("@")[0] ||
    "Anonymous";

  return await getOrCreateUser({ authUserId: user.id, email, name });
}
