import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant =
  | "focus"
  | "in-progress"
  | "due-today"
  | "overdue"
  | "reading"
  | "approved"
  | "rejected";

const variants: Record<Variant, string> = {
  focus: "bg-[#d4e8d4] text-[#3b6e45]",
  "in-progress":
    "bg-[#f0f4ee] text-[#5a7a5a] border border-[#c8ddc8]",
  "due-today": "bg-[#e8d9b8] text-[#8a6a30]",
  overdue: "bg-[#fce8e6] text-[#993530]",
  reading: "bg-[#e0eef8] text-[#2e5070]",
  approved: "bg-[#d4e8d4] text-[#3b6e45]",
  rejected: "bg-[#fce8e6] text-[#993530]",
};

export function Badge({
  variant = "focus",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[10px] py-[3px] text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
