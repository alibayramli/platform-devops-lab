import type { LabelHTMLAttributes } from "react";

import { cn } from "./cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  );
}
