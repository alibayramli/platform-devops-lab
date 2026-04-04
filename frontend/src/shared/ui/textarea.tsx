import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "./cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn("ui-textarea", className)} {...props} />;
  }
);

Textarea.displayName = "Textarea";
