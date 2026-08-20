import * as React from "react";

import { cn } from "../cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--line-strong)] bg-[rgba(16,19,16,0.72)] px-3.5 text-sm text-[var(--ink)] shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-[var(--ink-faint)] focus:border-[var(--lime)] focus:ring-2 focus:ring-[rgba(215,255,79,0.16)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
