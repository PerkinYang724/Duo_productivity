import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[#c8ddc8] bg-[#fffdf8] p-4",
        className
      )}
      {...props}
    />
  );
}
