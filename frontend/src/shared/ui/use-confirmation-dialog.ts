import { useContext } from "react";

import {
  ConfirmationDialogContext,
  type ConfirmationDialogContextValue
} from "./confirmation-dialog-context";

export function useConfirmationDialog(): ConfirmationDialogContextValue {
  const context = useContext(ConfirmationDialogContext);

  if (!context) {
    throw new Error("useConfirmationDialog must be used within ConfirmationDialogProvider");
  }

  return context;
}
