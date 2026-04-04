import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      neutral: "ui-badge-neutral",
      mint: "ui-badge-mint",
      sunrise: "ui-badge-sunrise",
      deep: "ui-badge-deep",
      danger: "ui-badge-danger"
    }
  },
  defaultVariants: {
    variant: "neutral"
  }
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
