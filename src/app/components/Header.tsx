import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "../../lib/actions";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between border-b border-[#d4e8d4] bg-[#fffdf8]/90 backdrop-blur px-4 py-3"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <Link
        href="/dashboard"
        className="text-[15px] font-medium text-[#3b6e45]"
      >
        Duo Productivity
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#7a9e7e] hover:bg-[#f0f4ee] active:scale-[0.97] transition-colors"
        >
          <LogOut size={16} />
        </button>
      </form>
    </header>
  );
}
