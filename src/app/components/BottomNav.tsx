"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListChecks, Eye, User } from "lucide-react";
import { cn } from "../../lib/cn";

const TABS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/task", label: "Task", icon: ListChecks },
  { href: "/verification", label: "Verify", icon: Eye },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-[#d4e8d4] bg-[#fffdf8] px-1 pt-1.5"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1 rounded-[10px] active:bg-[#f0f4ee] transition-colors select-none"
          >
            <span
              className={cn(
                "inline-flex h-9 w-14 items-center justify-center rounded-full transition-colors",
                active ? "bg-[#d4e8d4]" : "bg-transparent"
              )}
            >
              <Icon
                size={20}
                className={active ? "text-[#3b6e45]" : "text-[#7a9e7e]"}
              />
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                active ? "text-[#3b6e45]" : "text-[#7a9e7e]"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
