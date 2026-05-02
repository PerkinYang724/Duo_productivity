import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "./db";
import type { AppUser } from "./types";

export async function requireAppUser(): Promise<AppUser> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    email ||
    "Anonymous";

  return await getOrCreateUser({ clerkId: userId, email, name });
}
