import type { TeamSummary } from "../../../shared/types/api";
import { cn } from "../../../shared/ui/cn";
import {
  resolveSummaryMetricValue,
  summaryMetricDefinitions,
  summaryMetricOrder,
  type SummaryMetricId
} from "../summary-metrics";

type TeamSummaryCardsProps = {
  summary: TeamSummary | undefined;
  onSelectMetric?: (metricId: SummaryMetricId) => void;
};

export type { SummaryMetricId } from "../summary-metrics";

export function TeamSummaryCards({ summary, onSelectMetric }: TeamSummaryCardsProps) {
  const metrics = summaryMetricOrder.map((metricId) => ({
    id: metricId,
    label: summaryMetricDefinitions[metricId].label,
    icon: summaryMetricDefinitions[metricId].icon,
    value: resolveSummaryMetricValue(metricId, summary)
  }));

  return (
    <section className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label}>
          {onSelectMetric ? (
            <button
              type="button"
              className="surface w-full p-3 text-left transition-colors duration-200 hover:border-[var(--button-primary-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              onClick={() => onSelectMetric(metric.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                    {metric.label}
                  </h3>
                  <p className="mt-1 text-2xl font-bold leading-none text-theme-primary">
                    {metric.value}
                  </p>
                </div>
                <span className={cn("text-theme-muted")}>
                  <metric.icon size={16} />
                </span>
              </div>
            </button>
          ) : (
            <article className="surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                    {metric.label}
                  </h3>
                  <p className="mt-1 text-2xl font-bold leading-none text-theme-primary">
                    {metric.value}
                  </p>
                </div>
                <span className={cn("text-theme-muted")}>
                  <metric.icon size={16} />
                </span>
              </div>
            </article>
          )}
        </div>
      ))}
    </section>
  );
}
