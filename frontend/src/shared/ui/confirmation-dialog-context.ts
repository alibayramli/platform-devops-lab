import { createContext } from "react";

type ConfirmationTone = "danger" | "default";

export type ConfirmationOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
};

export type ConfirmationDialogContextValue = (options: ConfirmationOptions) => Promise<boolean>;

export type ConfirmationRequest = Required<ConfirmationOptions>;

export const ConfirmationDialogContext = createContext<ConfirmationDialogContextValue | null>(null);
