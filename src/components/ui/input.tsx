import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[10px] border border-[#b5d4b5] bg-[#fffdf8] px-[14px] py-[10px] text-[16px] text-[#3b5e3b] placeholder:text-[#a0c0a0] focus:border-[#5a9e6a] focus:outline-none disabled:bg-[#f0f4ee] disabled:text-[#7a9e7e]",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[15px] font-medium text-[#3b5e3b]", className)}
      {...props}
    />
  );
}
