import type { TeamSummary } from "../../../shared/types/api";
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

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function TeamSummaryCards({ summary, onSelectMetric }: TeamSummaryCardsProps) {
  const metrics = summaryMetricOrder.map((metricId) => ({
    id: metricId,
    label: summaryMetricDefinitions[metricId].label,
    icon: summaryMetricDefinitions[metricId].icon,
    value: resolveSummaryMetricValue(metricId, summary)
  }));

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const content = (
          <>
            <div className="metric-card-top">
              <div className="metric-card-label">
                <span className="metric-card-dot" />
                {metric.label}
              </div>
            </div>

            <div className="metric-card-value-row">
              <span className="metric-card-value">{formatNumber(metric.value)}</span>
              <span className="ui-badge ui-badge-deep">
                <metric.icon size={14} />
                Live
              </span>
            </div>

            <div className="metric-card-note">Open the detailed breakdown for this metric.</div>
          </>
        );

        return onSelectMetric ? (
          <button
            key={metric.id}
            type="button"
            className="metric-card dashboard-panel w-full text-left"
            onClick={() => onSelectMetric(metric.id)}
          >
            {content}
          </button>
        ) : (
          <article key={metric.id} className="metric-card dashboard-panel">
            {content}
          </article>
        );
      })}
    </section>
  );
}
