import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "./cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "input-shell h-10 w-full rounded-lg border px-3.5 text-sm outline-none ring-0 transition-colors duration-150 focus:border-[var(--button-primary-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
