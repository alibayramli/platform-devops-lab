import { LoaderCircle } from "lucide-react";

type DataSyncIndicatorProps = {
  label?: string;
};

export function DataSyncIndicator({
  label = "Refreshing workspace data..."
}: DataSyncIndicatorProps) {
  return (
    <div className="sync-indicator" role="status" aria-live="polite" aria-label={label}>
      <LoaderCircle size={14} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}
