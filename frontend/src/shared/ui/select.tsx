import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "ui-select cursor-pointer disabled:cursor-not-allowed disabled:opacity-65",
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
