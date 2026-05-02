import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  leftIcon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[#5a9e6a] text-[#fffdf8] hover:bg-[#6aae7a] disabled:bg-[#a0c0a0]",
  secondary:
    "bg-[#f0f4ee] text-[#3b6e45] border border-[#b5d4b5] hover:bg-[#e6ede2]",
  ghost:
    "bg-transparent text-[#5a9e6a] border border-[#b5d4b5] hover:bg-[#f0f4ee]",
  danger:
    "bg-transparent text-[#e8564a] border border-[#e8b3ad] hover:bg-[#fce8e6]",
};

export function Button({
  variant = "primary",
  leftIcon,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-[9px] text-[13px] font-medium transition-colors active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
