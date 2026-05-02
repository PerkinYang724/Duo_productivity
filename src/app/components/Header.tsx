import Link from "next/link";
import { signOutAction } from "../../lib/actions";
import { supabaseServer } from "../../lib/supabase-server";

export default async function Header() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const email = user?.email ?? "";

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
      <Link href="/dashboard" className="font-semibold">
        Duo Productivity
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/task" className="hover:underline">
          Today&apos;s task
        </Link>
        <Link href="/verification" className="hover:underline">
          Verify
        </Link>
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
        <span className="text-zinc-500 truncate max-w-[160px]">{email}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
          >
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
