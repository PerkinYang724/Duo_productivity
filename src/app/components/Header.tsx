import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Header() {
  const user = await currentUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "";

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
        <span className="text-zinc-500">{name}</span>
        <UserButton />
      </nav>
    </header>
  );
}
