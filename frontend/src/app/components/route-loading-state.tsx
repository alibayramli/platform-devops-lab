import { LoaderCircle } from "lucide-react";

import { Card } from "../../shared/ui/card";

type RouteLoadingStateProps = {
  label?: string;
};

export function RouteLoadingState({ label = "Loading view..." }: RouteLoadingStateProps) {
  return (
    <Card className="detail-card">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]" role="status">
        <LoaderCircle size={16} className="animate-spin" />
        <span>{label}</span>
      </div>
    </Card>
  );
}
