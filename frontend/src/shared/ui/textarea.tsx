import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "./cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "input-shell min-h-[96px] w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none ring-0 transition-colors duration-150 focus:border-[var(--button-primary-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
