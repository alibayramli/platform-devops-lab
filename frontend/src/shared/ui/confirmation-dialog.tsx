import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

import { Button } from "./button";
import {
  ConfirmationDialogContext,
  type ConfirmationOptions,
  type ConfirmationRequest
} from "./confirmation-dialog-context";

type ConfirmationDialogProviderProps = {
  children: ReactNode;
};

function ConfirmationDialog({
  request,
  onCancel,
  onConfirm
}: {
  request: ConfirmationRequest;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  return createPortal(
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div
        className="confirm-dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="confirm-dialog-header">
          <span
            className={`confirm-dialog-icon confirm-dialog-icon-${request.tone}`}
            aria-hidden="true"
          >
            <AlertTriangle size={18} />
          </span>
          <div className="confirm-dialog-copy">
            <h2 id={titleId} className="confirm-dialog-title">
              {request.title}
            </h2>
            <p id={descriptionId} className="confirm-dialog-description">
              {request.description}
            </p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          <Button ref={cancelButtonRef} type="button" variant="outline" onClick={onCancel}>
            {request.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={request.tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {request.confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmationDialogProvider({ children }: ConfirmationDialogProviderProps) {
  const [request, setRequest] = useState<ConfirmationRequest | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!request) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resolverRef.current?.(false);
        resolverRef.current = null;
        setRequest(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [request]);

  function resolveRequest(result: boolean) {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setRequest(null);
  }

  function confirm(options: ConfirmationOptions): Promise<boolean> {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setRequest({
        cancelLabel: "Cancel",
        confirmLabel: "Confirm",
        tone: "default",
        ...options
      });
    });
  }

  return (
    <ConfirmationDialogContext.Provider value={confirm}>
      {children}
      {request ? (
        <ConfirmationDialog
          request={request}
          onCancel={() => resolveRequest(false)}
          onConfirm={() => resolveRequest(true)}
        />
      ) : null}
    </ConfirmationDialogContext.Provider>
  );
}
