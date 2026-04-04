import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

const buttonVariants = cva("ui-button focus-visible:outline-none disabled:pointer-events-none", {
  variants: {
    variant: {
      primary: "ui-button-primary",
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

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
