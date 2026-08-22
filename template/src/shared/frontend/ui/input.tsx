import * as React from "react";

import { cn } from "../cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-(--line-strong) bg-(--surface-input) px-3.5 text-sm text-(--ink) shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-(--ink-faint) focus:border-(--lime) focus:ring-2 focus:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
