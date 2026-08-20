import * as React from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-2.5 font-semibold uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-(--lime) text-[#101310]",
        secondary: "border-(--line-strong) bg-(--deep-raised) text-(--ink-muted)",
        outline: "border-(--line-strong) bg-transparent text-(--ink-muted)",
        success: "border-[rgba(215,255,79,0.25)] bg-[rgba(215,255,79,0.1)] text-(--lime)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
