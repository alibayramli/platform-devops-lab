import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

const buttonVariants = cva("ui-button focus-visible:outline-none disabled:pointer-events-none", {
  variants: {
    variant: {
      primary: "ui-button-primary",
      danger: "ui-button-danger",
      sunrise: "ui-button-sunrise",
      ghost: "ui-button-ghost",
      outline: "ui-button-outline",
      tab: "ui-button-tab"
    },
    size: {
      sm: "ui-button-sm",
      md: "ui-button-md",
      lg: "ui-button-lg"
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md"
  }
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);

Button.displayName = "Button";
