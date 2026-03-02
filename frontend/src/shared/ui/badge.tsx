import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)]",
        mint: "bg-[var(--badge-mint-bg)] text-[var(--badge-mint-text)]",
        sunrise: "bg-[var(--badge-sunrise-bg)] text-[var(--badge-sunrise-text)]",
        deep: "bg-[var(--badge-deep-bg)] text-[var(--badge-deep-text)]",
        danger: "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)]"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
