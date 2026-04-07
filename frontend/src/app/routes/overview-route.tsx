import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import {
  countTasksByPriority,
  countTasksDueWithinDays,
  countTasksWithDescriptions,
  formatPercent
} from "../../features/tasks/lib/task-analytics";
import { formatNumber } from "../../shared/lib/format";
import type { Task, TeamSummary } from "../../shared/types/api";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";
import { buildActivity, buildChart, buildMetricCards } from "./overview-route.helpers";

type OverviewRouteProps = {
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  tasks: Task[];
  totalTaskCount: number;
  onSelectMetric: (metricId: SummaryMetricId) => void;
};

export function OverviewRoute({
  summary,
  activeTeamName,
  tasks,
  totalTaskCount,
  onSelectMetric
}: OverviewRouteProps) {
  const metrics = useMemo(() => buildMetricCards(summary, tasks), [summary, tasks]);
  const chart = useMemo(() => buildChart(tasks), [tasks]);
  const activity = useMemo(() => buildActivity(tasks), [tasks]);
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

  const highPriorityCount = countTasksByPriority(tasks, "high");
  const mediumPriorityCount = countTasksByPriority(tasks, "medium");
  const lowPriorityCount = countTasksByPriority(tasks, "low");
  const tasksWithNotes = countTasksWithDescriptions(tasks);
  const dueSoon = countTasksDueWithinDays(tasks, 7);

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition} className="metrics-row">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            type="button"
            className="metric-card dashboard-panel text-left"
            onClick={() => onSelectMetric(metric.id)}
          >
            <div className="metric-card-top">
              <div className="metric-card-label">
                <span className="metric-card-dot" />
                {metric.label}
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-card-value">{formatNumber(metric.value)}</span>
              <span
                className="metric-card-trend"
                style={{
                  color: metric.direction === "down" ? "var(--danger)" : "var(--success)"
                }}
              >
                {metric.direction === "down" ? (
                  <ArrowDownRight size={15} />
                ) : (
                  <ArrowUpRight size={15} />
                )}
                {metric.trend}%
              </span>
            </div>
            <div className="metric-card-note">{metric.note}</div>
          </button>
        ))}
      </motion.div>

      <div className="overview-grid">
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="chart-panel">
            <div className="chart-header">
              <div>
                <h2 className="section-title">Monthly Productivity Overview</h2>
                <p className="section-subtitle">
                  {activeTeamName
                    ? `Track task progress and completion rates for ${activeTeamName}.`
                    : "Track task progress and completion rates over time."}
                </p>
                <p className="chart-helper-copy">Move across the bars to compare monthly output.</p>
              </div>
            </div>

            <div className="productivity-chart">
              <div className="chart-axis" aria-hidden="true">
                {[3000, 2500, 2000, 1500, 1000, 500].map((value) => (
                  <div key={value} className="chart-axis-label">
                    {value}
                  </div>
                ))}
              </div>

              <div>
                <div className="chart-grid">
                  {[0, 20, 40, 60, 80, 100].map((value) => (
                    <div key={value} className="chart-grid-line" style={{ top: `${value}%` }} />
                  ))}

                  <div className="chart-columns">
                    {chart.map((month, index) => (
                      <div
                        key={month.label}
                        className="chart-column"
                        tabIndex={0}
                        data-active={activeChartIndex === index}
                        aria-label={`${month.label}: ${formatNumber(month.completedHeight)} completed out of ${formatNumber(month.totalHeight)} total`}
                        onMouseEnter={() => setActiveChartIndex(index)}
                        onMouseLeave={() => setActiveChartIndex(null)}
                        onFocus={() => setActiveChartIndex(index)}
                        onBlur={() => setActiveChartIndex(null)}
                      >
                        <div className="chart-column-bars">
                          {activeChartIndex === index ? (
                            <div
                              className="chart-column-tooltip"
                              style={{
                                bottom: `min(calc(${(month.totalHeight / 3000) * 100}% + 0.55rem), calc(100% - 2.35rem))`
                              }}
                            >
                              <strong>{month.label}</strong>
                              <span>
                                {`${formatNumber(month.completedHeight)} done · ${formatPercent(
                                  (month.completedHeight / Math.max(month.totalHeight, 1)) * 100
                                )}`}
                              </span>
                            </div>
                          ) : null}
                          <div
                            className="chart-bar-back"
                            style={{ height: `${(month.totalHeight / 3000) * 100}%` }}
                          />
                          <div
                            className="chart-bar-front"
                            style={{ height: `${(month.completedHeight / 3000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-months">
                  {chart.map((month) => (
                    <div key={month.label} className="chart-month-label">
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="insights-panel">
            <div className="insights-header">
              <div>
                <h2 className="section-title">Task Distribution & Activity</h2>
                <p className="section-subtitle">Monitor task status in real time.</p>
              </div>
            </div>

            <div className="insights-grid">
              <div className="insight-stats">
                <div>
                  <div className="insight-stat-label">High Priority</div>
                  <div className="insight-stat-value">{formatNumber(highPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Medium Priority</div>
                  <div className="insight-stat-value">{formatNumber(mediumPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Low Priority</div>
                  <div className="insight-stat-value">{formatNumber(lowPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Assigned Today</div>
                  <div className="insight-stat-value">{formatNumber(totalTaskCount)}</div>
                  <div className="insight-stat-subvalue">
                    /{formatNumber(Math.max(totalTaskCount, 1))}
                  </div>
                </div>
                <div>
                  <div className="insight-stat-label">With Notes</div>
                  <div className="insight-stat-value">{formatNumber(tasksWithNotes)}</div>
                  <div className="insight-stat-subvalue">descriptions added</div>
                </div>
                <div>
                  <div className="insight-stat-label">Due Soon</div>
                  <div className="insight-stat-value">{formatNumber(dueSoon)}</div>
                  <div className="insight-stat-subvalue">next 7 days</div>
                </div>
              </div>

              <div className="activity-strip" aria-label="Task activity strip">
                {activity.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className={
                      index % 4 === 0 || index % 5 === 0 ? "activity-bar" : "activity-bar faint"
                    }
                    style={{ height: `${value}px` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatedRouteSection>
  );
}
