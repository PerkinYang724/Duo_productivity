import { cn } from "../../lib/cn";

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[#d4e8d4]", className)} />;
}
