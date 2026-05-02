import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a9e7e]",
        className
      )}
      {...props}
    />
  );
}
