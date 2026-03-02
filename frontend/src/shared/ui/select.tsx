import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "input-shell h-10 w-full cursor-pointer rounded-lg border px-3.5 text-sm outline-none ring-0 transition-colors duration-150 focus:border-[var(--button-primary-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-65",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
