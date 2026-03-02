import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type CardProps = HTMLAttributes<HTMLElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <section
      className={cn("theme-card glass-panel rounded-2xl border p-4 md:p-5", className)}
      {...props}
    />
  );
}
